import { getDifficulty } from './difficulty';

describe('getDifficulty', () => {
  it('buckets 7 days or fewer as diva', () => {
    expect(getDifficulty(6)).toBe('diva');
    expect(getDifficulty(7)).toBe('diva');
  });

  it('buckets 8-13 days as manageable', () => {
    expect(getDifficulty(8)).toBe('manageable');
    expect(getDifficulty(13)).toBe('manageable');
  });

  it('buckets 14 days or more as easy', () => {
    expect(getDifficulty(14)).toBe('easy');
    expect(getDifficulty(30)).toBe('easy');
  });
});
