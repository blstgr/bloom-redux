export type PlantDifficulty = 'diva' | 'easy' | 'manageable';

const DIVA_MAX_INTERVAL_DAYS = 7;
const MANAGEABLE_MAX_INTERVAL_DAYS = 13;

/** Derived from wateringIntervalDays rather than stored — see docs/favs-spec.md. */
export function getDifficulty(wateringIntervalDays: number): PlantDifficulty {
  if (wateringIntervalDays <= DIVA_MAX_INTERVAL_DAYS) return 'diva';
  if (wateringIntervalDays <= MANAGEABLE_MAX_INTERVAL_DAYS) return 'manageable';
  return 'easy';
}
