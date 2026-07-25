import { PLANT_DESCRIPTION_MAX_CHARS } from '../features/plants/data/plantDescription';

import { generateSpeciesCopy, PlantCopyApiError } from './plantCopyApi';
import type { GeneratedSpeciesCopy, PerenualSpeciesDetails, ResolvedCareFacts } from './types';

const RESOLVED_FACTS: ResolvedCareFacts = {
  isToxicToPets: false,
  potSizeRecommendationCm: '2-4',
  repottingScheduleYears: '2-3',
  wateringIntervalDays: 14,
};

const RAW_DETAILS: PerenualSpeciesDetails = {
  care_level: 'Moderate',
  common_name: 'ZZ plant',
  default_image: null,
  dimensions: null,
  growth_rate: 'Low',
  id: 1,
  poisonous_to_humans: false,
  poisonous_to_pets: false,
  scientific_name: ['Zamioculcas zamiifolia'],
  sunlight: ['part shade'],
  watering_general_benchmark: { unit: 'days', value: '14' },
};

function mockChatCompletion(...contents: GeneratedSpeciesCopy[]) {
  const fetchMock = jest.fn();
  contents.forEach(content => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(content) } }] }),
      ok: true,
    });
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function mockRawChatCompletion(rawContent: string) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    json: () => Promise.resolve({ choices: [{ message: { content: rawContent } }] }),
    ok: true,
  }) as unknown as typeof fetch;
}

describe('generateSpeciesCopy', () => {
  it('returns the generated copy as-is when the description fits the budget', async () => {
    const copy: GeneratedSpeciesCopy = {
      category: 'Independent Roommate',
      description: 'Short description.',
      wikiArticle: 'A longer article.',
    };
    mockChatCompletion(copy);

    expect(await generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).toEqual(copy);
  });

  it('regenerates once with a tighter budget when the description overflows', async () => {
    const tooLong: GeneratedSpeciesCopy = {
      category: 'Independent Roommate',
      description: 'x'.repeat(PLANT_DESCRIPTION_MAX_CHARS + 50),
      wikiArticle: 'A longer article.',
    };
    const fitsAfterRetry: GeneratedSpeciesCopy = {
      category: 'Independent Roommate',
      description: 'A properly sized description.',
      wikiArticle: 'A longer article.',
    };
    const fetchMock = mockChatCompletion(tooLong, fitsAfterRetry);

    const result = await generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS);
    expect(result).toEqual(fitsAfterRetry);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to a deterministic sentence-boundary trim if the retry still overflows', async () => {
    const sentence = 'x'.repeat(PLANT_DESCRIPTION_MAX_CHARS - 10);
    const stillTooLong: GeneratedSpeciesCopy = {
      category: 'Independent Roommate',
      description: `${sentence}. ${'y'.repeat(50)}.`,
      wikiArticle: 'A longer article.',
    };
    mockChatCompletion(stillTooLong, stillTooLong);

    const result = await generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS);
    expect(result.description.length).toBeLessThanOrEqual(PLANT_DESCRIPTION_MAX_CHARS);
    expect(result.description.endsWith('.')).toBe(true);
  });

  it('throws a network PlantCopyApiError when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('offline')) as unknown as typeof fetch;
    await expect(generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).rejects.toMatchObject<Partial<PlantCopyApiError>>({
      kind: 'network',
    });
  });

  it('throws an unknown PlantCopyApiError on a non-2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).rejects.toBeInstanceOf(PlantCopyApiError);
  });

  it('throws a classified PlantCopyApiError when the model returns malformed JSON', async () => {
    mockRawChatCompletion('{not valid json');

    await expect(generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).rejects.toMatchObject<Partial<PlantCopyApiError>>({
      kind: 'unknown',
    });
  });

  it('throws a classified PlantCopyApiError when the response is missing a required field', async () => {
    mockRawChatCompletion(JSON.stringify({ category: 'Independent Roommate', description: 'desc' }));

    await expect(generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).rejects.toMatchObject<Partial<PlantCopyApiError>>({
      kind: 'unknown',
    });
  });

  it('throws a classified PlantCopyApiError when a field has the wrong type', async () => {
    mockRawChatCompletion(
      JSON.stringify({ category: 'Independent Roommate', description: 123, wikiArticle: 'article' }),
    );

    await expect(generateSpeciesCopy(RESOLVED_FACTS, RAW_DETAILS)).rejects.toMatchObject<Partial<PlantCopyApiError>>({
      kind: 'unknown',
    });
  });
});
