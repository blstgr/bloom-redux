import { getUnsplashAccessKey } from './config';
import { UNSPLASH_BASE_URL } from './constants';
import type { UnsplashSearchResponse } from './types';

const FIRST_RESULT_INDEX = 0;
const SEARCH_RESULT_COUNT = 1;

/** Searches Unsplash for a real, licensed photo matching the query. Returns null on no match —
 * callers are expected to try a broader query or fall back, not treat this as an error. */
export async function searchPhoto(query: string): Promise<string | null> {
  const url = `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${SEARCH_RESULT_COUNT}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Client-ID ${getUnsplashAccessKey()}` },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const payload = (await response.json()) as UnsplashSearchResponse;
  return payload.results[FIRST_RESULT_INDEX]?.urls.regular ?? null;
}
