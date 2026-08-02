import { getPerenualApiKey } from './config';
import { PERENUAL_BASE_URL } from './constants';
import type { PerenualSpeciesDetails, PerenualSpeciesListItem, PerenualSpeciesListResponse } from './types';

export type PlantApiErrorKind = 'forbidden' | 'network' | 'rate-limited' | 'unknown';

export class PlantApiError extends Error {
  kind: PlantApiErrorKind;

  constructor(kind: PlantApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlantApiError';
  }
}

const RATE_LIMITED_STATUS = 429;
const FORBIDDEN_STATUS = 403;

async function readResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

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
    // Perenual returns 429 for both a burst-rate throttle and the daily quota being exhausted —
    // its response body is the only way to tell which, so surface it directly rather than a
    // generic message that looks identical for either cause.
    const body = await readResponseBody(response);
    throw new PlantApiError(
      'rate-limited',
      `Plant species database rate limit exceeded for now.${body ? ` Response: ${body}` : ''}`,
    );
  }

  if (response.status === FORBIDDEN_STATUS) {
    // Distinct from every other failure: this means the key/IP itself is rejected (e.g. an
    // IP-allowlist mismatch), not a bad match or a temporary network blip.
    const body = await readResponseBody(response);
    throw new PlantApiError(
      'forbidden',
      `Plant species database access denied.${body ? ` Response: ${body}` : ''}`,
    );
  }

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw new PlantApiError(
      'unknown',
      `Species lookup failed with status ${response.status}.${body ? ` Response: ${body}` : ''}`,
    );
  }

  return (await response.json()) as T;
}

/** GET species-list?q=<name>&indoor=1 — used by LibraryScreen's search-as-you-type and by the
 * add-plant pipeline to resolve an accepted Pl@ntNet identification to a Perenual speciesId.
 * Indoor-only since Bloom is exclusively about houseplants — without this filter, results are
 * dominated by outdoor trees/shrubs (e.g. searching "L" surfaces Maples and Firs) that have no
 * relevance to what anyone would actually add to this app.
 *
 * Falls back to an unfiltered search if the indoor-filtered one comes up empty — confirmed
 * directly against the real API that Perenual's own "indoor" tagging is incomplete, so a real,
 * findable houseplant can still get wrongly excluded by that filter. Only costs a second request
 * in that (uncommon) empty-result case, never on the common path. */
export async function searchSpecies(name: string): Promise<PerenualSpeciesListItem[]> {
  const query = encodeURIComponent(name);
  const indoorResults = await fetchPerenual<PerenualSpeciesListResponse>(`/species-list?q=${query}&indoor=1`);
  if (indoorResults.data.length > 0) return indoorResults.data;

  const unfilteredResults = await fetchPerenual<PerenualSpeciesListResponse>(`/species-list?q=${query}`);
  return unfilteredResults.data;
}

/** GET species/details/{id} — raw care facts for a specific species. */
export async function getSpeciesDetails(id: number): Promise<PerenualSpeciesDetails> {
  return fetchPerenual<PerenualSpeciesDetails>(`/species/details/${id}`);
}
