import type { PerenualSpeciesDetails } from '../../../services/types';

import { findMockSpeciesByName } from './mockPlants';

const DEFAULT_CARE_LEVEL = 'Moderate';
const DEFAULT_GROWTH_RATE = 'Moderate';
const DEFAULT_WATERING_UNIT = 'days';
const DEFAULT_WATERING_VALUE = '7';
const BRIGHT_SUNLIGHT = ['full sun'];
const LOW_SUNLIGHT = ['part shade'];

/**
 * MOCKED FALLBACK — Perenual's `species/details/{id}` requires a paid plan (confirmed via a real
 * 403 "Please Upgrade Plan" response on the free-tier key this app uses); it's the only Perenual
 * endpoint that's actually blocked. Every other call in the resolution pipeline (Pl@ntNet
 * identify, Perenual `species-list` search, Unsplash photo search, DeepSeek copy generation)
 * still hits the real API — only this one response gets synthesized, so callers should reach for
 * this ONLY when `getSpeciesDetails` itself throws a `PlantApiError`. `knownName` is the real,
 * accurate name already returned by whichever real call ran first (search result or Pl@ntNet
 * identification) — never invented here. Care facts come from this app's own curated seed data
 * when the name matches one of the 12 mock species; otherwise safe generic defaults, matching
 * careDerivation.ts's own fallback values.
 */
export function buildFallbackSpeciesDetails(perenualId: number, knownName: string): PerenualSpeciesDetails {
  const matchedMock = findMockSpeciesByName(knownName);

  return {
    care_level: DEFAULT_CARE_LEVEL,
    common_name: knownName,
    default_image: null,
    dimensions: null,
    growth_rate: DEFAULT_GROWTH_RATE,
    id: perenualId,
    poisonous_to_humans: false,
    poisonous_to_pets: matchedMock?.isToxicToPets ?? false,
    scientific_name: [],
    sunlight: matchedMock ? (matchedMock.lightNeed === 'low' ? LOW_SUNLIGHT : BRIGHT_SUNLIGHT) : null,
    watering_general_benchmark: {
      unit: DEFAULT_WATERING_UNIT,
      value: matchedMock ? String(matchedMock.wateringIntervalDays) : DEFAULT_WATERING_VALUE,
    },
  };
}
