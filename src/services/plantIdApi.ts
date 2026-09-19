import { Image, type ImageSourcePropType } from 'react-native';

import { getPlantNetApiKey } from './config';
import { PLANTNET_BASE_URL, PLANTNET_MIN_CONFIDENCE_SCORE, PLANTNET_MIN_SCORE_GAP, PLANTNET_PROJECT } from './constants';
import { FORBIDDEN_STATUS, readResponseBody, TOO_MANY_REQUESTS_STATUS } from './http';
import type { IdentificationResult, PlantNetCandidate, PlantNetIdentifyResponse } from './types';

export type PlantIdApiErrorKind = 'forbidden' | 'network' | 'quota-exceeded' | 'unknown';

export class PlantIdApiError extends Error {
  kind: PlantIdApiErrorKind;

  constructor(kind: PlantIdApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlantIdApiError';
  }
}

// Pl@ntNet auto-detects which plant organ is in frame rather than requiring the caller to
// specify leaf/flower/fruit/bark up front.
const IDENTIFY_ORGAN = 'auto';
const IDENTIFY_IMAGE_NAME = 'plant.jpg';
const IDENTIFY_IMAGE_TYPE = 'image/jpeg';
// Pl@ntNet's docs don't guarantee an English default for commonNames — without this, results can
// come back in the requester's inferred locale, which then fails to match Perenual's
// English-only species database downstream.
const IDENTIFY_LANG = 'en';

/** POSTs a captured/selected photo to Pl@ntNet and returns its ranked candidate list. */
export async function identifyPlant(image: ImageSourcePropType): Promise<PlantNetCandidate[]> {
  const { uri } = Image.resolveAssetSource(image);

  const formData = new FormData();
  formData.append('images', {
    name: IDENTIFY_IMAGE_NAME,
    type: IDENTIFY_IMAGE_TYPE,
    uri,
  } as unknown as Blob);
  formData.append('organs', IDENTIFY_ORGAN);

  const url = `${PLANTNET_BASE_URL}/identify/${PLANTNET_PROJECT}?api-key=${getPlantNetApiKey()}&lang=${IDENTIFY_LANG}`;

  let response: Response;
  try {
    response = await fetch(url, { body: formData, method: 'POST' });
  } catch {
    throw new PlantIdApiError('network', 'Could not reach the plant identification service.');
  }

  if (response.status === TOO_MANY_REQUESTS_STATUS) {
    // Pl@ntNet returns 429 for both a burst-rate throttle and the daily quota being exhausted —
    // its response body is the only way to tell which, so surface it directly rather than a
    // generic message that looks identical for either cause.
    const body = await readResponseBody(response);
    throw new PlantIdApiError(
      'quota-exceeded',
      `Plant identification quota exceeded for today.${body ? ` Response: ${body}` : ''}`,
    );
  }

  if (response.status === FORBIDDEN_STATUS) {
    // Distinct from every other failure: this means the key/IP itself is rejected (e.g. an
    // IP-allowlist mismatch), not a bad photo or a temporary network blip — bucketing it with
    // those would tell the user to "try better lighting" for a problem that has nothing to do
    // with the photo.
    const body = await readResponseBody(response);
    throw new PlantIdApiError(
      'forbidden',
      `Plant identification access denied.${body ? ` Response: ${body}` : ''}`,
    );
  }

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw new PlantIdApiError(
      'unknown',
      `Plant identification failed with status ${response.status}.${body ? ` Response: ${body}` : ''}`,
    );
  }

  const payload = (await response.json()) as PlantNetIdentifyResponse;
  return payload.results;
}

/** The name identifyAndResolveSpecies would actually search Perenual with for this candidate —
 * used to tell a genuinely ambiguous runner-up (a different plant) from a harmless one (the same
 * plant appearing twice, e.g. two catalog entries both called "Mini monstera"). */
function resolvedCandidateName(candidate: PlantNetCandidate): string {
  return candidate.species.commonNames[0] ?? candidate.species.scientificNameWithoutAuthor;
}

/** Case/whitespace-insensitive comparison — confirmed live that Pl@ntNet's own catalog entries
 * for the same plant can differ only in spacing/capitalization (e.g. "Rubberplant" vs. "Rubber
 * Plant"), which raw string equality would wrongly treat as two different plants. */
function normalizeForComparison(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

/**
 * Shared accept/reject decision so AddPlantLoaderScreen and LibraryScreen's photo search can
 * never disagree on what counts as a confident match. Requires a minimum absolute score. A close
 * runner-up only rejects the match if it's for a genuinely different plant — confirmed against
 * real responses that Pl@ntNet can return near-tied top-2 candidates that are the same plant under
 * slightly different catalog names (e.g. "Mini monstera"/"Mini monstera" at 0.42/0.39, and
 * "Rubberplant"/"Rubber Plant" at 0.51/0.46), which the old gap check rejected as ambiguous even
 * though every candidate resolves to the exact same downstream search.
 */
export function resolveIdentification(candidates: PlantNetCandidate[]): IdentificationResult {
  const [top, second] = candidates;

  if (!top) {
    return { accepted: false, reason: 'no-candidates' };
  }

  if (top.score < PLANTNET_MIN_CONFIDENCE_SCORE) {
    return { accepted: false, reason: 'low-confidence' };
  }

  const gap = top.score - (second?.score ?? 0);
  const runnerUpIsDifferentPlant =
    second !== undefined &&
    normalizeForComparison(resolvedCandidateName(second)) !== normalizeForComparison(resolvedCandidateName(top));
  if (runnerUpIsDifferentPlant && gap < PLANTNET_MIN_SCORE_GAP) {
    return { accepted: false, reason: 'low-confidence' };
  }

  return { accepted: true, candidate: top };
}
