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

  it('appends the response body to a 429 error, to distinguish burst vs daily quota', async () => {
    mockFetchOnce({ ok: false, status: 429, text: () => Promise.resolve('daily limit reached') });
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'quota-exceeded',
      message: expect.stringContaining('daily limit reached'),
    });
  });

  it('throws an unknown PlantIdApiError on other non-2xx responses', async () => {
    mockFetchOnce({ ok: false, status: 500 });
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'unknown',
    });
  });

  it('throws forbidden with the response body on a 403 (e.g. IP not allowed), distinct from unknown', async () => {
    mockFetchOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('{"message":"error: remote IP not allowed"}'),
    });
    await expect(identifyPlant({ uri: 'file:///test.jpg' })).rejects.toMatchObject<Partial<PlantIdApiError>>({
      kind: 'forbidden',
      message: expect.stringContaining('remote IP not allowed'),
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

  it('rejects as low-confidence when two DIFFERENT candidates are too close together', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + 0.2, { commonNames: ['Plant A'] });
    const second = buildCandidate(
      PLANTNET_MIN_CONFIDENCE_SCORE + 0.2 - (PLANTNET_MIN_SCORE_GAP - 0.01),
      { commonNames: ['Plant B'] },
    );
    expect(resolveIdentification([top, second])).toEqual({ accepted: false, reason: 'low-confidence' });
  });

  it('accepts despite a close runner-up when both candidates resolve to the same name', () => {
    // Reproduces a real Pl@ntNet response: two near-tied catalog entries both named "Mini
    // monstera" (0.42 vs 0.39) — no real ambiguity for the user even though the raw scores are
    // close, since either candidate resolves to the identical downstream search.
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + 0.2, { commonNames: ['Mini monstera'] });
    const second = buildCandidate(
      PLANTNET_MIN_CONFIDENCE_SCORE + 0.2 - (PLANTNET_MIN_SCORE_GAP - 0.01),
      { commonNames: ['Mini monstera'] },
    );
    expect(resolveIdentification([top, second])).toEqual({ accepted: true, candidate: top });
  });

  it('accepts despite a close runner-up when the same plant is spelled differently across candidates', () => {
    // Reproduces a real Pl@ntNet response: "Rubberplant" (0.51) vs "Rubber Plant" (0.46) — same
    // plant, same downstream search once whitespace/casing is normalized, but raw string equality
    // would treat these as two different plants and wrongly reject on the 0.05 score gap.
    const top = buildCandidate(0.51, { commonNames: ['Rubberplant'] });
    const second = buildCandidate(0.46, { commonNames: ['Rubber Plant'] });
    expect(resolveIdentification([top, second])).toEqual({ accepted: true, candidate: top });
  });

  it('treats candidates as the same plant via their scientific name when neither has a common name', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + 0.2, { commonNames: [], scientificNameWithoutAuthor: 'Rhaphidophora tetrasperma' });
    const second = buildCandidate(
      PLANTNET_MIN_CONFIDENCE_SCORE + 0.2 - (PLANTNET_MIN_SCORE_GAP - 0.01),
      { commonNames: [], scientificNameWithoutAuthor: 'Rhaphidophora tetrasperma' },
    );
    expect(resolveIdentification([top, second])).toEqual({ accepted: true, candidate: top });
  });

  it('accepts a lone high-scoring candidate with no runner-up to compare against', () => {
    const top = buildCandidate(PLANTNET_MIN_CONFIDENCE_SCORE + PLANTNET_MIN_SCORE_GAP);
    expect(resolveIdentification([top])).toEqual({ accepted: true, candidate: top });
  });
});
