import type { OwnedPlant, PlantSpecies } from '../src/features/plants/data/mockPlants';
import { isWateringDue, isWateringTooSoon } from '../src/features/plants/data/schedule';

const TEST_SPECIES: PlantSpecies = {
  category: 'Test',
  description: 'Test plant',
  detailImage: 1,
  detailImageUrl: 'https://example.com/detail.jpg',
  image: 1,
  speciesId: 'test-species',
  speciesName: 'Test species',
  wateringDay: '1',
  wateringIntervalDays: 10,
  wateringMonth: 'Jan',
};

function createOwnedPlant(overrides: Partial<OwnedPlant>): OwnedPlant {
  return {
    addedAt: '2026-07-05T12:00:00.000Z',
    customName: 'Test plant',
    image: TEST_SPECIES.image,
    ownedPlantId: 'owned-test',
    speciesId: TEST_SPECIES.speciesId,
    wateringHistory: [],
    ...overrides,
  };
}

describe('watering schedule due state', () => {
  it('treats an unwatered plant added today as due for today regardless of time', () => {
    const ownedPlant = createOwnedPlant({});

    expect(isWateringDue(ownedPlant, TEST_SPECIES, new Date('2026-07-05T12:00:00.000Z'))).toBe(true);
  });

  it('does not mark an unwatered future plant as due', () => {
    const ownedPlant = createOwnedPlant({
      addedAt: '2026-07-06T00:00:00.000Z',
    });

    expect(isWateringDue(ownedPlant, TEST_SPECIES, new Date('2026-07-05T12:00:00.000Z'))).toBe(false);
  });

  it('marks plants due when the next watering date is today or in the past', () => {
    const ownedPlant = createOwnedPlant({
      wateringHistory: ['2026-06-25T12:00:00.000Z'],
    });

    expect(isWateringDue(ownedPlant, TEST_SPECIES, new Date('2026-07-05T12:00:00.000Z'))).toBe(true);
  });

  it('does not mark a plant watered today as due', () => {
    const ownedPlant = createOwnedPlant({
      wateringHistory: ['2026-07-05T08:00:00.000Z'],
    });

    expect(isWateringDue(ownedPlant, TEST_SPECIES, new Date('2026-07-05T23:00:00.000Z'))).toBe(false);
  });

  it('uses calendar days for too-soon checks so due plants are not blocked near midnight', () => {
    const oneDaySpecies = { ...TEST_SPECIES, wateringIntervalDays: 1 };
    const ownedPlant = createOwnedPlant({
      wateringHistory: ['2026-07-04T23:50:00.000'],
    });
    const now = new Date('2026-07-05T00:05:00.000');

    expect(isWateringDue(ownedPlant, oneDaySpecies, now)).toBe(true);
    expect(isWateringTooSoon(ownedPlant, oneDaySpecies, now)).toBe(false);
  });
});
