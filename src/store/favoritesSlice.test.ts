import reducer, { addFavorite, removeFavorite, toggleFavorite, type FavoriteItem } from './favoritesSlice';

const zzPlant: FavoriteItem = {
  addedAt: '2026-01-01T00:00:00.000Z',
  image: 1,
  speciesId: 'species-1',
  speciesName: 'ZZ plant',
};

const prayerPlant: FavoriteItem = {
  addedAt: '2026-01-02T00:00:00.000Z',
  image: 2,
  speciesId: 'species-2',
  speciesName: 'Prayer plant',
};

describe('favoritesSlice', () => {
  it('addFavorite adds a new species to an empty list', () => {
    const state = reducer([], addFavorite(zzPlant));
    expect(state).toEqual([zzPlant]);
  });

  it('addFavorite is a no-op when the species is already present', () => {
    const state = reducer([zzPlant], addFavorite(zzPlant));
    expect(state).toEqual([zzPlant]);
  });

  it('removeFavorite drops a species by speciesId', () => {
    const state = reducer([zzPlant, prayerPlant], removeFavorite(zzPlant.speciesId));
    expect(state).toEqual([prayerPlant]);
  });

  it('removeFavorite is a no-op when the speciesId is not present', () => {
    const state = reducer([zzPlant], removeFavorite('missing-species'));
    expect(state).toEqual([zzPlant]);
  });

  it('toggleFavorite adds the species when absent (toggle-on)', () => {
    const state = reducer([], toggleFavorite(zzPlant));
    expect(state).toEqual([zzPlant]);
  });

  it('toggleFavorite removes the species when present (toggle-off)', () => {
    const state = reducer([zzPlant], toggleFavorite(zzPlant));
    expect(state).toEqual([]);
  });
});
