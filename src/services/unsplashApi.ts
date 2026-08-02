import { getUnsplashAccessKey } from './config';
import { UNSPLASH_BASE_URL } from './constants';
import type { UnsplashPhoto, UnsplashSearchResponse } from './types';

const FIRST_RESULT_INDEX = 0;
// Unsplash's full-text relevance ranking is unreliable for plant names — confirmed directly
// against the real API that its #1 hit for "ZZ plant" is a rubber plant photo tagged only "green
// leaf plant", while a genuine ZZ plant photo (alt_description "zz plant stem against white
// background") was sitting at position 2. Fetching a page of candidates and preferring one whose
// own alt/description text actually names the plant catches this; per_page=1 with blind trust in
// the top hit does not.
const SEARCH_RESULT_COUNT = 10;
// Words generic enough to appear in nearly any houseplant photo's description (and so unable to
// distinguish one plant from another) — stripped before matching so what's left is only the
// query's actually-distinguishing words (e.g. "zz" out of "ZZ plant").
const GENERIC_QUERY_WORDS = new Set(['a', 'of', 'plant', 'plants', 'the']);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractDistinguishingPhrase(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0 && !GENERIC_QUERY_WORDS.has(word))
    .join(' ');
}

/**
 * A photo "confirms" a query only once the distinguishing words show up ADJACENT to each other,
 * in order — not just present somewhere each in the text. Confirmed live that requiring only
 * independent presence is too loose: a fashion portrait's own description contains both "ponytail"
 * (the model's hairstyle) and "palm" (blurry background trees) for the unrelated query "ponytail
 * palm", so it wrongly confirmed as a match. Requiring the words adjacent (as they'd appear if a
 * description were actually about the plant) rejects that false positive while still matching
 * every real case already confirmed working (e.g. "zz plant stem against white background"
 * contains "zz plant" adjacently).
 */
function describesQuery(photo: UnsplashPhoto, distinguishingPhrase: string): boolean {
  if (!distinguishingPhrase) return false;

  const text = `${photo.alt_description ?? ''} ${photo.description ?? ''}`.toLowerCase();
  return new RegExp(`\\b${escapeRegExp(distinguishingPhrase)}\\b`).test(text);
}

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
  const distinguishingPhrase = extractDistinguishingPhrase(query);
  // Prefer the first result whose own text confirms it matches; fall back to Unsplash's own
  // top-ranked hit (the prior behavior) if nothing confirms — still our best available guess.
  const confirmedMatch = payload.results.find(photo => describesQuery(photo, distinguishingPhrase));

  return (confirmedMatch ?? payload.results[FIRST_RESULT_INDEX])?.urls.regular ?? null;
}
