import { getSpeciesDetails, PlantApiError, searchSpecies } from './plantApi';
import type { PerenualSpeciesDetails, PerenualSpeciesListResponse } from './types';

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce(response) as unknown as typeof fetch;
}

function mockFetchRejectOnce() {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('offline')) as unknown as typeof fetch;
}

describe('searchSpecies', () => {
  it('returns the data array on success', async () => {
    const payload: PerenualSpeciesListResponse = {
      data: [{ common_name: 'ZZ plant', default_image: null, id: 42, scientific_name: ['Zamioculcas zamiifolia'] }],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    const results = await searchSpecies('zz');
    expect(results).toEqual(payload.data);
  });

  it('returns an empty array when there is no match', async () => {
    mockFetchOnce({ json: () => Promise.resolve({ data: [] }), ok: true });
    expect(await searchSpecies('nonexistent-species')).toEqual([]);
  });

  it('throws a network PlantApiError when fetch rejects', async () => {
    mockFetchRejectOnce();
    await expect(searchSpecies('zz')).rejects.toMatchObject<Partial<PlantApiError>>({ kind: 'network' });
  });

  it('throws a PlantApiError on a non-2xx response', async () => {
    mockFetchOnce({ ok: false, status: 500 });
    await expect(searchSpecies('zz')).rejects.toBeInstanceOf(PlantApiError);
  });
});

describe('getSpeciesDetails', () => {
  it('returns the parsed details on success', async () => {
    const details: PerenualSpeciesDetails = {
      care_level: 'Moderate',
      common_name: 'ZZ plant',
      default_image: null,
      dimensions: null,
      growth_rate: 'Low',
      id: 42,
      poisonous_to_humans: false,
      poisonous_to_pets: true,
      scientific_name: ['Zamioculcas zamiifolia'],
      sunlight: ['part shade'],
      watering_general_benchmark: { unit: 'days', value: '14' },
    };
    mockFetchOnce({ json: () => Promise.resolve(details), ok: true });

    expect(await getSpeciesDetails(42)).toEqual(details);
  });

  it('throws a network PlantApiError when fetch rejects', async () => {
    mockFetchRejectOnce();
    await expect(getSpeciesDetails(42)).rejects.toMatchObject<Partial<PlantApiError>>({ kind: 'network' });
  });
});
