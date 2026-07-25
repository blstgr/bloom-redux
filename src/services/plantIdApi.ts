import { Image, type ImageSourcePropType } from 'react-native';

import { getPlantNetApiKey } from './config';
import { PLANTNET_BASE_URL, PLANTNET_MIN_CONFIDENCE_SCORE, PLANTNET_MIN_SCORE_GAP, PLANTNET_PROJECT } from './constants';
import type { IdentificationResult, PlantNetCandidate, PlantNetIdentifyResponse } from './types';

export type PlantIdApiErrorKind = 'network' | 'quota-exceeded' | 'unknown';

export class PlantIdApiError extends Error {
  kind: PlantIdApiErrorKind;

  constructor(kind: PlantIdApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlantIdApiError';
  }
}

const QUOTA_EXCEEDED_STATUS = 429;
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

  if (response.status === QUOTA_EXCEEDED_STATUS) {
    throw new PlantIdApiError('quota-exceeded', 'Plant identification quota exceeded for today.');
  }

  if (!response.ok) {
    throw new PlantIdApiError('unknown', `Plant identification failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as PlantNetIdentifyResponse;
  return payload.results;
}

/**
 * Shared accept/reject decision so AddPlantLoaderScreen and LibraryScreen's photo search can
 * never disagree on what counts as a confident match. Requires both a minimum absolute score and
 * a minimum gap over the runner-up, so two similarly-scored candidates don't get auto-accepted.
 */
export function resolveIdentification(candidates: PlantNetCandidate[]): IdentificationResult {
  const [top, second] = candidates;

  if (!top) {
    return { accepted: false, reason: 'no-candidates' };
  }

  const gap = top.score - (second?.score ?? 0);
  if (top.score < PLANTNET_MIN_CONFIDENCE_SCORE || gap < PLANTNET_MIN_SCORE_GAP) {
    return { accepted: false, reason: 'low-confidence' };
  }

  return { accepted: true, candidate: top };
}
