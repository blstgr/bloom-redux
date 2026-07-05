import { mockSpecies } from '../src/features/plants/data/mockPlants';
import {
  buildPlantDescription,
  PLANT_DESCRIPTION_MAX_CHARS,
} from '../src/features/plants/data/plantDescription';

describe('plant description contract', () => {
  it('keeps generated species descriptions within the detail-card copy budget', () => {
    for (const species of mockSpecies) {
      expect(species.description.length).toBeLessThanOrEqual(PLANT_DESCRIPTION_MAX_CHARS);
    }
  });

  it('rejects generated descriptions that would overflow the detail card', () => {
    expect(() =>
      buildPlantDescription({
        careNote: 'is extremely dramatic and complicated and fussy and sensitive and needs constant attention',
        light: 'bright indirect light with no sudden changes',
        potSizeCm: '10-12',
        repotYears: '1-2',
        wateringIntervalDays: 10,
      }),
    ).toThrow(`Plant description must be ${PLANT_DESCRIPTION_MAX_CHARS} characters or fewer.`);
  });
});
