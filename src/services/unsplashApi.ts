import { getUnsplashAccessKey } from './config';
import { UNSPLASH_BASE_URL } from './constants';
import type { UnsplashPhoto, UnsplashSearchResponse } from './types';

// Unsplash's full-text relevance ranking is unreliable for plant names — confirmed directly
// against the real API that its #1 hit for "ZZ plant" is a rubber plant photo tagged only "green
// leaf plant", while a genuine ZZ plant photo (alt_description "zz plant stem against white
// background") was sitting at position 2. Fetching a page of candidates and preferring one whose
// own alt/description text actually names the plant catches this; per_page=1 with blind trust in
// the top hit does not.
const SEARCH_RESULT_COUNT = 10;
// Words too generic to identify a plant on their own. A name that reduces to nothing but these
// cannot be confirmed by any photo's text, so the caller must try a different name tier instead.
export const GENERIC_QUERY_WORDS = new Set(['a', 'of', 'plant', 'plants', 'the', 'tree', 'trees']);
// Unsplash's ranking is semantically good but its text never names the species (see describesQuery).
// So text is used only NEGATIVELY: a top-ranked result is accepted when its own words read as a
// plant photo, and rejected otherwise. Confirmed live that this is what separates the usable hit
// from the absurd one for "prayer plant": result 0 is "green and brown plant in brown clay pot"
// while the praying statue that previously won sits at result 8 with no plant word at all.
const PLANT_CONTEXT_WORDS = [
  'plant', 'plants', 'leaf', 'leaves', 'foliage', 'pot', 'potted', 'succulent', 'cactus',
  'flower', 'flowers', 'blossom', 'fern', 'palm', 'garden', 'greenery', 'houseplant', 'botanical',
];

function looksLikeAPlantPhoto(photo: UnsplashPhoto): boolean {
  const text = `${photo.alt_description ?? ''} ${photo.description ?? ''}`.toLowerCase();
  return PLANT_CONTEXT_WORDS.some(word => new RegExp(`\\b${word}\\b`).test(text));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeQueryPhrase(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * A photo "confirms" a query only when the WHOLE query appears adjacently, in order, in the
 * photo's own text — not when some part of it does.
 *
 * Three real, confirmed false positives shaped this rule:
 * - Unsplash's #1 hit for "ZZ plant" was a rubber plant tagged only "green leaf plant", while a
 *   genuine match ("zz plant stem against white background") sat at position 2. Ranking alone
 *   cannot be trusted.
 * - A fashion portrait's description contained "ponytail" (the model's hair) and "palm" (blurry
 *   background trees) for "ponytail palm" — both present, neither about the plant. Words must be
 *   adjacent, as they would be in a description actually about the plant.
 * - Matching on only the name's distinguishing part confirmed a photo of a PRAYING STATUE for
 *   "prayer plant", because stripping the generic word "plant" left the bare word "prayer".
 *   Systematic for any common-noun name: money tree, rubber/snake/spider plant. Hence the whole
 *   phrase, never a fragment.
 */
function describesQuery(photo: UnsplashPhoto, phrase: string): boolean {
  if (!phrase) return false;

  const text = `${photo.alt_description ?? ''} ${photo.description ?? ''}`.toLowerCase();
  return new RegExp(`\\b${escapeRegExp(phrase)}\\b`).test(text);
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
  const phrase = normalizeQueryPhrase(query);
  // 1. A photo whose own text names the whole plant is the best evidence there is — rare, but
  //    decisive when present (e.g. "zz plant stem against white background").
  const confirmedMatch = payload.results.find(photo => describesQuery(photo, phrase));
  if (confirmedMatch) return confirmedMatch.urls.regular;

  // 2. Otherwise trust Unsplash's own ranking, which IS semantically good, but only for a result
  //    that at least reads as a plant photo. This is what rejects the statue, the birthday card
  //    and the mosque that "prayer plant" otherwise returns.
  const plausibleMatch = payload.results.find(looksLikeAPlantPhoto);
  if (plausibleMatch) return plausibleMatch.urls.regular;

  // 3. Nothing usable. Returning null lets findSpeciesPhotoUrl try the scientific name and then
  //    the genus, and only if every tier fails does the species fall back to the generic
  //    "no photo available" asset.
  return null;
}
