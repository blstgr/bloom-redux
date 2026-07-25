import type { PerenualDimensions, PerenualSpeciesDetails, PotSizeBucket, RepottingYearsBucket, ResolvedCareFacts } from './types';

const DEFAULT_WATERING_INTERVAL_DAYS = 7;
const DEFAULT_REPOTTING_YEARS: RepottingYearsBucket = '2-3';

const SMALL_MAX_HEIGHT_CM = 30;
const MEDIUM_MAX_HEIGHT_CM = 100;

const POT_SIZE_CM_BY_BUCKET: Record<PotSizeBucket, string> = {
  large: '3-5',
  medium: '2-4',
  small: '2-3',
};

const REPOTTING_YEARS_BY_GROWTH_RATE: Record<string, RepottingYearsBucket> = {
  High: '1-2',
  Low: '3-4',
  Moderate: '2-3',
};

const UNIT_TO_CM: Record<string, number> = {
  cm: 1,
  feet: 30.48,
  ft: 30.48,
  inch: 2.54,
  inches: 2.54,
};

function parseWateringIntervalDays(
  benchmark: PerenualSpeciesDetails['watering_general_benchmark'],
): number {
  if (!benchmark) return DEFAULT_WATERING_INTERVAL_DAYS;

  const match = /^(\d+)(?:-(\d+))?$/.exec(benchmark.value.trim());
  if (!match) return DEFAULT_WATERING_INTERVAL_DAYS;

  const low = Number(match[1]);
  const high = match[2] ? Number(match[2]) : low;
  return Math.round((low + high) / 2);
}

function getMatureHeightCm(dimensions: PerenualDimensions[] | null): number | null {
  if (!dimensions || dimensions.length === 0) return null;

  const height = dimensions.find(dimension => dimension.type?.toLowerCase() === 'height') ?? dimensions[0];
  if (typeof height.max_value !== 'number') return null;

  const unitScale = height.unit ? (UNIT_TO_CM[height.unit.toLowerCase()] ?? 1) : 1;
  return height.max_value * unitScale;
}

function resolvePotSizeBucket(dimensions: PerenualDimensions[] | null): PotSizeBucket {
  const heightCm = getMatureHeightCm(dimensions);
  if (heightCm === null) return 'medium';
  if (heightCm < SMALL_MAX_HEIGHT_CM) return 'small';
  if (heightCm < MEDIUM_MAX_HEIGHT_CM) return 'medium';
  return 'large';
}

/**
 * Deterministic, species-grounded care facts derived from raw Perenual data — no LLM involved.
 * Same input always produces the same output, so DeepSeek-generated copy and WateringSchedule's
 * date math can never disagree on these numbers.
 */
export function resolveCareFacts(details: PerenualSpeciesDetails): ResolvedCareFacts {
  const potSizeBucket = resolvePotSizeBucket(details.dimensions);
  const repottingScheduleYears = details.growth_rate
    ? (REPOTTING_YEARS_BY_GROWTH_RATE[details.growth_rate] ?? DEFAULT_REPOTTING_YEARS)
    : DEFAULT_REPOTTING_YEARS;

  return {
    isToxicToPets: details.poisonous_to_pets,
    potSizeRecommendationCm: POT_SIZE_CM_BY_BUCKET[potSizeBucket],
    repottingScheduleYears,
    wateringIntervalDays: parseWateringIntervalDays(details.watering_general_benchmark),
  };
}
