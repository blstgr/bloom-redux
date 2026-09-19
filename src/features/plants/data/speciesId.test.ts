import { toPerenualSpeciesId } from './speciesId';

describe('toPerenualSpeciesId', () => {
  it('parses a Perenual id', () => {
    expect(toPerenualSpeciesId('42')).toBe(42);
  });

  it('returns null for a seed slug, which has no remote record to fetch', () => {
    expect(toPerenualSpeciesId('zz-plant')).toBeNull();
    expect(toPerenualSpeciesId('monstera-deliciosa')).toBeNull();
  });

  it('returns null for an absent id', () => {
    expect(toPerenualSpeciesId(undefined)).toBeNull();
    expect(toPerenualSpeciesId('')).toBeNull();
  });

  it('rejects values that parse numerically but cannot be a Perenual id', () => {
    // Number('') is 0 and Number(' 12 ') is 12 -- a bare Number()/isNaN check accepts both.
    expect(toPerenualSpeciesId('0')).toBeNull();
    expect(toPerenualSpeciesId('-5')).toBeNull();
    expect(toPerenualSpeciesId('4.5')).toBeNull();
  });
});
