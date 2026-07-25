import { getPerenualApiKey } from './config';
import { PERENUAL_BASE_URL } from './constants';
import type { PerenualSpeciesDetails, PerenualSpeciesListItem, PerenualSpeciesListResponse } from './types';

export type PlantApiErrorKind = 'network' | 'no-match' | 'rate-limited' | 'unknown';

export class PlantApiError extends Error {
  kind: PlantApiErrorKind;

  constructor(kind: PlantApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlantApiError';
  }
}

const RATE_LIMITED_STATUS = 429;

async function fetchPerenual<T>(path: string): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${PERENUAL_BASE_URL}${path}${separator}key=${getPerenualApiKey()}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new PlantApiError('network', 'Could not reach the plant species database.');
  }

  if (response.status === RATE_LIMITED_STATUS) {
    throw new PlantApiError('rate-limited', 'Plant species database rate limit exceeded for now.');
  }

  if (!response.ok) {
    throw new PlantApiError('unknown', `Species lookup failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

/** GET species-list?q=<name>&indoor=1 — used by LibraryScreen's search-as-you-type and by the
 * add-plant pipeline to resolve an accepted Pl@ntNet identification to a Perenual speciesId.
 * Indoor-only since Bloom is exclusively about houseplants — without this filter, results are
 * dominated by outdoor trees/shrubs (e.g. searching "L" surfaces Maples and Firs) that have no
 * relevance to what anyone would actually add to this app. */
export async function searchSpecies(name: string): Promise<PerenualSpeciesListItem[]> {
  const query = encodeURIComponent(name);
  const payload = await fetchPerenual<PerenualSpeciesListResponse>(`/species-list?q=${query}&indoor=1`);
  return payload.data;
}

/** GET species/details/{id} — raw care facts for a specific species. */
export async function getSpeciesDetails(id: number): Promise<PerenualSpeciesDetails> {
  return fetchPerenual<PerenualSpeciesDetails>(`/species/details/${id}`);
}
