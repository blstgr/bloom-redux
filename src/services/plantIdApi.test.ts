import { PLANTNET_MIN_CONFIDENCE_SCORE, PLANTNET_MIN_SCORE_GAP } from './constants';
import { identifyPlant, PlantIdApiError, resolveIdentification } from './plantIdApi';
import type { PlantNetCandidate, PlantNetIdentifyResponse } from './types';

function buildCandidate(score: number, overrides: Partial<PlantNetCandidate['species']> = {}): PlantNetCandidate {
  return {
    score,
    species: {
      commonNames: ['Test Plant'],
      family: { scientificNameWithoutAuthor: 'Testaceae' },
      genus: { scientificNameWithoutAuthor: 'Testus' },
      scientificNameWithoutAuthor: 'Testus plantus',
      ...overrides,
    },
  };
}

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce(response) as unknown as typeof fetch;
}

describe('identifyPlant', () => {
  it('returns the ranked candidate list on success', async () => {
    const payload: PlantNetIdentifyResponse = {
      remainingIdentificationRequests: 100,
      results: [buildCandidate(0.9)],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    const results = await identifyPlant({ uri: 'file:///test.jpg' });
    expect(results).toEqual(payload.results);
  });

  it('throws a network PlantIdApiError when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('offline')) as unknown as typeof fetch;
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'network',
    });
  });

  it('throws a quota-exceeded PlantIdApiError on a 429 response', async () => {
    mockFetchOnce({ ok: false, status: 429 });
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'quota-exceeded',
    });
  });

  it('throws an unknown PlantIdApiError on other non-2xx responses', async () => {
    mockFetchOnce({ ok: false, status: 500 });
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'unknown',
    });
  });
});

describe('resolveIdentification', () => {
  it('rejects with no-candidates when the list is empty', () => {
    expect(resolveIdentification([])).toEqual({ accepted: false, reason: 'no-candidates' });
  });

  it('accepts a candidate that clears both the confidence and gap thresholds', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + PLANTNET_MIN_SCORE_GAP);
    const second = buildCandidate(0);
    const result = resolveIdentification([top, second]);
    expect(result).toEqual({ accepted: true, candidate: top });
  });

  it('rejects as low-confidence when the top score is below the confidence threshold', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE - 0.01);
    expect(resolveIdentification([top])).toEqual({ accepted: false, reason: 'low-confidence' });
  });

  it('rejects as low-confidence when two candidates are too close together', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + 0.2);
    const second = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + 0.2 - (PLANTNET_MIN_SCORE_GAP - 0.01));
    expect(resolveIdentification([top, second])).toEqual({ accepted: false, reason: 'low-confidence' });
  });

  it('accepts a lone high-scoring candidate with no runner-up to compare against', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + PLANTNET_MIN_SCORE_GAP);
    expect(resolveIdentification([top])).toEqual({ accepted: true, candidate: top });
  });
});
