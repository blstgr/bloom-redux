import React from 'react';
import { act, create } from 'react-test-renderer';

import { getSpeciesDetails, PlantApiError, searchSpecies } from '../../../services/plantApi';
import { generateSpeciesCopy } from '../../../services/plantCopyApi';
import { identifyPlant, PlantIdApiError } from '../../../services/plantIdApi';
import type { PerenualSpeciesDetails, PerenualSpeciesListItem } from '../../../services/types';
import { searchPhoto } from '../../../services/unsplashApi';

import type { PlantSpecies } from './mockPlants';
import {
  PlantDataProvider,
  usePlantData,
  type PlantDataContextValue,
  type SpeciesLookupResult,
} from './PlantDataProvider';

// Factory mocks (not bare jest.mock automocks) so PlantApiError/PlantIdApiError keep their real
// constructors — automocking them would strip the `this.kind = kind` assignment, breaking the
// provider's `error instanceof X && error.kind === '...'` checks under test.
jest.mock('../../../services/plantApi', () => ({
  ...jest.requireActual('../../../services/plantApi'),
  getSpeciesDetails: jest.fn(),
  searchSpecies: jest.fn(),
}));
jest.mock('../../../services/plantIdApi', () => ({
  ...jest.requireActual('../../../services/plantIdApi'),
  identifyPlant: jest.fn(),
}));
jest.mock('../../../services/plantCopyApi');
jest.mock('../../../services/unsplashApi');

const mockSearchSpecies = searchSpecies as jest.MockedFunction<typeof searchSpecies>;
const mockGetSpeciesDetails = getSpeciesDetails as jest.MockedFunction<typeof getSpeciesDetails>;
const mockGenerateSpeciesCopy = generateSpeciesCopy as jest.MockedFunction<typeof generateSpeciesCopy>;
const mockSearchPhoto = searchPhoto as jest.MockedFunction<typeof searchPhoto>;
const mockIdentifyPlant = identifyPlant as jest.MockedFunction<typeof identifyPlant>;

const MATCH: PerenualSpeciesListItem = {
  common_name: 'ZZ plant',
  default_image: null,
  id: 42,
  scientific_name: ['Zamioculcas zamiifolia'],
};

const DETAILS: PerenualSpeciesDetails = {
  care_level: 'Moderate',
  common_name: 'ZZ plant',
  default_image: { medium_url: 'https://example.com/zz-medium.jpg', original_url: 'https://example.com/zz.jpg', small_url: '' },
  dimensions: null,
  growth_rate: 'Low',
  id: 42,
  poisonous_to_humans: false,
  poisonous_to_pets: true,
  scientific_name: ['Zamioculcas zamiifolia'],
  sunlight: ['part shade'],
  watering_general_benchmark: { unit: 'days', value: '14' },
};

function TestHarness({ onReady }: { onReady: (value: PlantDataContextValue) => void }) {
  const value = usePlantData();
  onReady(value);
  return null;
}

function renderProvider() {
  let latest!: PlantDataContextValue;
  act(() => {
    create(
      <PlantDataProvider>
        <TestHarness
          onReady={value => {
            latest = value;
          }}
        />
      </PlantDataProvider>,
    );
  });
  return () => latest;
}

async function expectResolvedSpecies(
  getValue: () => PlantDataContextValue,
  perenualId: number,
): Promise<PlantSpecies> {
  const result = await getValue().resolveSpeciesById(perenualId);
  if (!result.success) throw new Error(`Expected successful resolution, got: ${JSON.stringify(result)}`);
  return result.species;
}

describe('PlantDataProvider species caching', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockSearchSpecies.mockResolvedValue([MATCH]);
    mockGetSpeciesDetails.mockResolvedValue(DETAILS);
    mockGenerateSpeciesCopy.mockResolvedValue({
      category: 'Independent Roommate',
      description: 'Likes bright indirect light.',
      wikiArticle: 'A longer article.',
    });
  });

  it('only generates copy once per species across repeated resolutions', async () => {
    const getValue = renderProvider();

    let first: PlantSpecies;
    let second: PlantSpecies;
    await act(async () => {
      first = await expectResolvedSpecies(getValue, MATCH.id);
      second = await expectResolvedSpecies(getValue, MATCH.id);
    });

    expect(mockGetSpeciesDetails).toHaveBeenCalledTimes(1);
    expect(mockGenerateSpeciesCopy).toHaveBeenCalledTimes(1);
    expect(first!).toEqual(second!);
    expect(getValue().getSpeciesById('42')).toEqual(first!);
  });

  it('lookupSpeciesByName resolves through the same cache as resolveSpeciesById', async () => {
    const getValue = renderProvider();

    await act(async () => {
      await expectResolvedSpecies(getValue, MATCH.id);
    });

    let byName;
    await act(async () => {
      byName = await getValue().lookupSpeciesByName('ZZ plant');
    });

    expect(mockGenerateSpeciesCopy).toHaveBeenCalledTimes(1);
    expect(byName).toEqual({ species: getValue().getSpeciesById('42'), success: true });
  });

  it('lookupSpeciesByName reports no-perenual-match when the search returns nothing', async () => {
    mockSearchSpecies.mockResolvedValueOnce([]);
    const getValue = renderProvider();

    let result;
    await act(async () => {
      result = await getValue().lookupSpeciesByName('unknown plant');
    });

    expect(result).toEqual({ reason: 'no-perenual-match', success: false });
  });
});

describe('PlantDataProvider photo resolution', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGenerateSpeciesCopy.mockResolvedValue({
      category: 'Independent Roommate',
      description: 'desc',
      wikiArticle: 'article',
    });
  });

  it('uses a real Perenual photo when available, without calling Unsplash', async () => {
    mockSearchSpecies.mockResolvedValue([MATCH]);
    mockGetSpeciesDetails.mockResolvedValue(DETAILS);
    const getValue = renderProvider();

    let species!: PlantSpecies;
    await act(async () => {
      species = await expectResolvedSpecies(getValue, MATCH.id);
    });

    expect(species.detailImageUrl).toBe('https://example.com/zz.jpg');
    expect(mockSearchPhoto).not.toHaveBeenCalled();
    expect(species.description).toBe('desc');
  });

  it("skips Perenual's upgrade-placeholder image and falls through to Unsplash", async () => {
    const detailsWithPlaceholder: PerenualSpeciesDetails = {
      ...DETAILS,
      default_image: {
        medium_url: 'https://s3.example.com/upgrade_access.jpg',
        original_url: 'https://s3.example.com/upgrade_access.jpg',
        small_url: '',
      },
    };
    mockSearchSpecies.mockResolvedValue([MATCH]);
    mockGetSpeciesDetails.mockResolvedValue(detailsWithPlaceholder);
    mockSearchPhoto.mockResolvedValueOnce('https://images.unsplash.com/exact-match.jpg');
    const getValue = renderProvider();

    let species!: PlantSpecies;
    await act(async () => {
      species = await expectResolvedSpecies(getValue, MATCH.id);
    });

    expect(mockSearchPhoto).toHaveBeenCalledWith('ZZ plant');
    expect(species.detailImageUrl).toBe('https://images.unsplash.com/exact-match.jpg');
  });

  it('falls through common name -> scientific name -> generic name tiers in order', async () => {
    const match: PerenualSpeciesListItem = { ...MATCH, common_name: 'Shirazz Japanese Maple' };
    const details: PerenualSpeciesDetails = {
      ...DETAILS,
      common_name: 'Shirazz Japanese Maple',
      default_image: null,
      scientific_name: ["Acer palmatum 'Gwen'"],
    };
    mockSearchSpecies.mockResolvedValue([match]);
    mockGetSpeciesDetails.mockResolvedValue(details);
    mockSearchPhoto
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('https://images.unsplash.com/generic.jpg');
    const getValue = renderProvider();

    let species!: PlantSpecies;
    await act(async () => {
      species = await expectResolvedSpecies(getValue, match.id);
    });

    expect(mockSearchPhoto).toHaveBeenNthCalledWith(1, 'Shirazz Japanese Maple');
    expect(mockSearchPhoto).toHaveBeenNthCalledWith(2, 'Acer palmatum');
    expect(mockSearchPhoto).toHaveBeenNthCalledWith(3, 'Japanese Maple');
    expect(species.detailImageUrl).toBe('https://images.unsplash.com/generic.jpg');
  });

  it('falls back to the local no-plant-photo asset when every tier fails and there is no captured photo', async () => {
    mockSearchSpecies.mockResolvedValue([MATCH]);
    mockGetSpeciesDetails.mockResolvedValue({ ...DETAILS, default_image: null });
    mockSearchPhoto.mockResolvedValue(null);
    const getValue = renderProvider();

    let species!: PlantSpecies;
    await act(async () => {
      species = await expectResolvedSpecies(getValue, MATCH.id);
    });

    expect(species.detailImageUrl).toBe('');
    expect(species.image).not.toEqual({ uri: expect.any(String) });
    expect(species.description.startsWith("We couldn't reliably find what this one looks like")).toBe(true);
  });

  it('uses the captured photo as a fallback when every real-photo tier fails', async () => {
    mockSearchSpecies.mockResolvedValue([MATCH]);
    mockGetSpeciesDetails.mockResolvedValue({ ...DETAILS, default_image: null });
    mockSearchPhoto.mockResolvedValue(null);
    const capturedImage = { uri: 'file:///captured.jpg' };
    const getValue = renderProvider();

    let result!: Awaited<ReturnType<PlantDataContextValue['lookupSpeciesByName']>>;
    await act(async () => {
      result = await getValue().lookupSpeciesByName('ZZ plant', capturedImage);
    });

    expect(result).toEqual({ species: expect.objectContaining({ image: capturedImage }), success: true });
    // Having the user's own photo counts as "having a photo" — no "couldn't find it" hedge needed.
    expect(result.success && result.species.description).toBe('desc');
  });
});

describe('PlantDataProvider rate limiting', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('resolveSpeciesById reports rate-limited distinctly from a generic network error', async () => {
    // Constructed via the same (auto-mocked) import PlantDataProvider.tsx itself uses, so the
    // instanceof check in its catch block actually matches — jest.requireActual would bypass the
    // mock and construct a class the production code's instanceof check can never match.
    mockGetSpeciesDetails.mockRejectedValueOnce(new PlantApiError('rate-limited', 'rate limited'));
    const getValue = renderProvider();

    let result;
    await act(async () => {
      result = await getValue().resolveSpeciesById(MATCH.id);
    });

    expect(result).toEqual({ reason: 'rate-limited', success: false });
  });

  it('identifyAndResolveSpecies reports rate-limited when Pl@ntNet quota is exceeded', async () => {
    mockIdentifyPlant.mockRejectedValueOnce(new PlantIdApiError('quota-exceeded', 'quota exceeded'));
    const getValue = renderProvider();

    let result;
    await act(async () => {
      result = await getValue().identifyAndResolveSpecies({ uri: 'file:///captured.jpg' });
    });

    expect(result).toEqual({ reason: 'rate-limited', success: false });
  });

  it('identifyAndResolveSpecies falls back to a generic network error for other identifyPlant failures', async () => {
    mockIdentifyPlant.mockRejectedValueOnce(new PlantIdApiError('network', 'offline'));
    const getValue = renderProvider();

    let result;
    await act(async () => {
      result = await getValue().identifyAndResolveSpecies({ uri: 'file:///captured.jpg' });
    });

    expect(result).toEqual({ reason: 'network-error', success: false });
  });
});

describe('PlantDataProvider concurrent resolution', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGenerateSpeciesCopy.mockResolvedValue({
      category: 'Independent Roommate',
      description: 'desc',
      wikiArticle: 'article',
    });
  });

  it('shares one Perenual/DeepSeek round trip across concurrent resolveSpeciesById calls for the same id', async () => {
    mockGetSpeciesDetails.mockResolvedValue(DETAILS);
    const getValue = renderProvider();

    let first!: SpeciesLookupResult;
    let second!: SpeciesLookupResult;
    await act(async () => {
      const firstPromise = getValue().resolveSpeciesById(MATCH.id);
      const secondPromise = getValue().resolveSpeciesById(MATCH.id);
      [first, second] = await Promise.all([firstPromise, secondPromise]);
    });

    expect(mockGetSpeciesDetails).toHaveBeenCalledTimes(1);
    expect(mockGenerateSpeciesCopy).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('never lets one caller\'s fallback image leak into a concurrent caller\'s result for the same species', async () => {
    mockGetSpeciesDetails.mockResolvedValue({ ...DETAILS, default_image: null });
    mockSearchPhoto.mockResolvedValue(null);
    const capturedImage = { uri: 'file:///captured.jpg' };
    const getValue = renderProvider();

    let withoutFallback!: SpeciesLookupResult;
    let withFallback!: SpeciesLookupResult;
    await act(async () => {
      const withoutFallbackPromise = getValue().resolveSpeciesById(MATCH.id);
      const withFallbackPromise = getValue().resolveSpeciesById(MATCH.id, capturedImage);
      [withoutFallback, withFallback] = await Promise.all([withoutFallbackPromise, withFallbackPromise]);
    });

    // Both callers still only cost one real Perenual/DeepSeek round trip...
    expect(mockGetSpeciesDetails).toHaveBeenCalledTimes(1);
    expect(mockGenerateSpeciesCopy).toHaveBeenCalledTimes(1);

    // ...but each still gets its OWN correct image/description, regardless of resolution order.
    expect(withoutFallback.success && withoutFallback.species.image).not.toEqual(capturedImage);
    expect(
      withoutFallback.success && withoutFallback.species.description.startsWith("We couldn't reliably find"),
    ).toBe(true);

    expect(withFallback.success && withFallback.species.image).toEqual(capturedImage);
    expect(withFallback.success && withFallback.species.description).toBe('desc');

    // The persisted cache (future unrelated lookups) always keeps the no-fallback version, never
    // whichever caller happened to resolve first.
    expect(getValue().getSpeciesById(String(MATCH.id))).toEqual(withoutFallback.success && withoutFallback.species);
  });
});
