import { buildFallbackSpeciesDetails } from './speciesDetailsFallback';

describe('buildFallbackSpeciesDetails', () => {
  it('uses the known name as-is and pulls care facts from a matching mock species', () => {
    const details = buildFallbackSpeciesDetails(42, 'ZZ plant');

    expect(details.common_name).toBe('ZZ plant');
    expect(details.id).toBe(42);
    expect(details.poisonous_to_pets).toBe(true);
    expect(details.watering_general_benchmark).toEqual({ unit: 'days', value: '14' });
    expect(details.sunlight).toEqual(['full sun']);
  });

  it('matches a name via alias, not just the exact curated speciesName', () => {
    const details = buildFallbackSpeciesDetails(7, 'Swiss cheese plant');

    expect(details.poisonous_to_pets).toBe(true);
    expect(details.watering_general_benchmark).toEqual({ unit: 'days', value: '10' });
  });

  it('maps a low-light mock species to a shade sunlight value', () => {
    const details = buildFallbackSpeciesDetails(4, 'Parlor Palm');

    expect(details.sunlight).toEqual(['part shade']);
    expect(details.poisonous_to_pets).toBe(false);
  });

  it('falls back to safe generic defaults for a name that matches no mock species', () => {
    const details = buildFallbackSpeciesDetails(999, 'Some Unrecognized Plant');

    expect(details.common_name).toBe('Some Unrecognized Plant');
    expect(details.poisonous_to_pets).toBe(false);
    expect(details.sunlight).toBeNull();
    expect(details.watering_general_benchmark).toEqual({ unit: 'days', value: '7' });
  });
});
