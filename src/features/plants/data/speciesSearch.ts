import { searchSpecies } from '../../../services/plantApi';
import type { PerenualSpeciesListItem } from '../../../services/types';

const MAX_RESULTS = 8;
const RANK_STARTS_WITH = 0;
const RANK_WORD_BOUNDARY = 1;
const RANK_SCIENTIFIC_NAME_MATCH = 2;

/** Scientific names carry punctuation ("Maranta leuconeura 'Erythroneura'") that a plain word
 * split leaves attached ("'erythroneura'") — strip anything that isn't a letter from each token's
 * edges before comparing. */
function getScientificNameTokens(scientificName: string[]): string[] {
  return scientificName
    .flatMap(name => name.toLowerCase().split(/\s+/))
    .map(token => token.replace(/^[^a-z]+|[^a-z]+$/g, ''))
    .filter(token => token.length > 0);
}

/**
 * Perenual's own search ranking is a poor fit for search-as-you-type: it matches substrings
 * across every field (scientific name, family, etc), not just the displayed common name, so a
 * query like "pa" comes back with real matches ("Paperbark Maple") mixed in with names that only
 * coincidentally contain the query mid-word ("Japanese Maple" via "ja-PA-nese"), with no
 * relevance signal distinguishing them. Rank what we did get — starts-with (common name) first,
 * then a word-boundary match (a new word in the common name starts with the query), then an exact
 * whole-word match against a scientific-name token (so searching a genus like "Maranta" still
 * finds species whose common name is something unrelated-looking like "prayer plant") — and drop
 * plain no-boundary substring matches entirely (e.g. "palm" merely prefixing "palmatum", not
 * equal to it), rather than pad the list with weak, coincidental hits.
 */
export function rankByRelevance(item: PerenualSpeciesListItem, normalizedQuery: string): number | null {
  const normalizedName = item.common_name.toLowerCase();
  if (normalizedName.startsWith(normalizedQuery)) return RANK_STARTS_WITH;
  if (normalizedName.includes(` ${normalizedQuery}`)) return RANK_WORD_BOUNDARY;

  // Match each typed word against the scientific-name tokens individually, not the whole query
  // as one token — otherwise a genus+species query ("Hoya carnosa") could never match, since no
  // single token ever equals a multi-word string.
  const scientificNameTokens = getScientificNameTokens(item.scientific_name);
  const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 0);
  if (queryTokens.every(token => scientificNameTokens.includes(token))) return RANK_SCIENTIFIC_NAME_MATCH;

  return null;
}

/**
 * Search Perenual and return only the results relevant to the query, closest first.
 *
 * This lives beside the other plant data rather than in LibraryScreen for two reasons: the
 * ranking above is domain knowledge about Perenual's index, not screen layout; and the screen
 * called `plantApi.searchSpecies` directly, opening a second seam onto a dependency the provider
 * already wraps. `rankByRelevance` is exported for its own tests -- the screen previously had to
 * export it, and a private rank constant, purely so a test could reach them.
 */
export async function searchSpeciesByRelevance(query: string): Promise<PerenualSpeciesListItem[]> {
  const items = await searchSpecies(query);

  return items
    .map(item => ({ item, rank: rankByRelevance(item, query) }))
    .filter((entry): entry is { item: PerenualSpeciesListItem; rank: number } => entry.rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .map(entry => entry.item)
    .slice(0, MAX_RESULTS);
}
