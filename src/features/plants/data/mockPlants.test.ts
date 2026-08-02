import { findMockSpeciesByName } from './mockPlants';

describe('findMockSpeciesByName', () => {
  it('matches an exact curated speciesName, case-insensitively', () => {
    expect(findMockSpeciesByName('zz plant')?.speciesId).toBe('zz-plant');
    expect(findMockSpeciesByName('Money Tree')?.speciesId).toBe('money-tree');
  });

  it('matches a common alias not in the curated speciesName', () => {
    expect(findMockSpeciesByName('Swiss cheese plant')?.speciesId).toBe('monstera-deliciosa');
    expect(findMockSpeciesByName("Devil's ivy")?.speciesId).toBe('marble-queen-pothos');
    expect(findMockSpeciesByName('Christmas cactus')?.speciesId).toBe('zygocactus');
  });

  it('returns undefined for an empty or unrecognized name', () => {
    expect(findMockSpeciesByName('')).toBeUndefined();
    expect(findMockSpeciesByName('   ')).toBeUndefined();
    expect(findMockSpeciesByName('Some Unrecognized Plant')).toBeUndefined();
  });

  it('does not misattribute care facts via a raw substring match (e.g. "zz" inside another word)', () => {
    // Reproduces a real risk: zz-plant's alias list includes the short 'zz' alias, which a raw
    // .includes() check would also match inside an unrelated name that merely contains "zz".
    expect(findMockSpeciesByName('Frizzle Sizzle')).toBeUndefined();
  });
});
