import type { PerenualSpeciesListItem } from '../services/types';

import { RANK_SCIENTIFIC_NAME_MATCH, rankByRelevance } from './LibraryScreen';

function buildItem(overrides: Partial<PerenualSpeciesListItem> = {}): PerenualSpeciesListItem {
  return {
    common_name: 'Test Plant',
    default_image: null,
    id: 1,
    scientific_name: ['Testus plantus'],
    ...overrides,
  };
}

describe('rankByRelevance', () => {
  it('ranks a common-name starts-with match highest', () => {
    const item = buildItem({ common_name: 'Parlor Palm' });
    expect(rankByRelevance(item, 'parlor')).toBe(0);
  });

  it('ranks a common-name word-boundary match second', () => {
    const item = buildItem({ common_name: 'Prayer Plant' });
    expect(rankByRelevance(item, 'plant')).toBe(1);
  });

  it('matches a genus search against the scientific name even when the common name is unrelated-looking', () => {
    // Real Perenual data: id 5159, common_name "prayer plant", scientific_name Maranta leuconeura.
    const item = buildItem({
      common_name: 'prayer plant',
      scientific_name: ['Maranta leuconeura var. erythroneura'],
    });
    expect(rankByRelevance(item, 'maranta')).toBe(RANK_SCIENTIFIC_NAME_MATCH);
  });

  it('does not match a query that is only a substring/prefix of a scientific-name word, not the whole word', () => {
    // Real regression case: "Palm" search must not match "Acer palmatum" (Japanese Maple) —
    // "palm" is a prefix of "palmatum", not equal to it.
    const item = buildItem({ common_name: 'Japanese Maple', scientific_name: ['Acer palmatum'] });
    expect(rankByRelevance(item, 'palm')).toBeNull();
  });

  it('strips punctuation from scientific-name tokens before comparing', () => {
    const item = buildItem({
      common_name: 'red-veined prayer plant',
      scientific_name: ["Maranta leuconeura 'Erythroneura'"],
    });
    expect(rankByRelevance(item, 'erythroneura')).toBe(RANK_SCIENTIFIC_NAME_MATCH);
  });

  it('returns null for a plain coincidental substring match in the common name', () => {
    // "Japanese" contains "pa" mid-word ("ja-pa-nese"), with no word boundary and no scientific
    // name relevance — should not match at all.
    const item = buildItem({ common_name: 'Japanese Maple', scientific_name: ['Acer palmatum'] });
    expect(rankByRelevance(item, 'pa')).toBeNull();
  });
});
