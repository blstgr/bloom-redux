import { resolveCareFacts } from './careDerivation';
import type { PerenualSpeciesDetails } from './types';

function buildDetails(overrides: Partial<PerenualSpeciesDetails> = {}): PerenualSpeciesDetails {
  return {
    care_level: 'Moderate',
    common_name: 'Test Plant',
    default_image: null,
    dimensions: null,
    growth_rate: 'Moderate',
    id: 1,
    poisonous_to_humans: false,
    poisonous_to_pets: false,
    scientific_name: ['Testus plantus'],
    sunlight: null,
    watering_general_benchmark: { unit: 'days', value: '7' },
    ...overrides,
  };
}

describe('resolveCareFacts', () => {
  describe('wateringIntervalDays', () => {
    it('takes the rounded midpoint of a range', () => {
      const facts = resolveCareFacts(
        buildDetails({ watering_general_benchmark: { unit: 'days', value: '5-7' } }),
      );
      expect(facts.wateringIntervalDays).toBe(6);
    });

    it('rounds a midpoint that lands on .5 up', () => {
      const facts = resolveCareFacts(
        buildDetails({ watering_general_benchmark: { unit: 'days', value: '5-6' } }),
      );
      expect(facts.wateringIntervalDays).toBe(6);
    });

    it('uses a single value as-is', () => {
      const facts = resolveCareFacts(
        buildDetails({ watering_general_benchmark: { unit: 'days', value: '10' } }),
      );
      expect(facts.wateringIntervalDays).toBe(10);
    });

    it('falls back to a default when benchmark is null', () => {
      const facts = resolveCareFacts(buildDetails({ watering_general_benchmark: null }));
      expect(facts.wateringIntervalDays).toBe(7);
    });

    it('falls back to a default when the value is unparseable', () => {
      const facts = resolveCareFacts(
        buildDetails({ watering_general_benchmark: { unit: 'days', value: 'often' } }),
      );
      expect(facts.wateringIntervalDays).toBe(7);
    });
  });

  describe('potSizeRecommendationCm bucket boundaries', () => {
    it('buckets small just under the small/medium threshold', () => {
      const facts = resolveCareFacts(
        buildDetails({
          dimensions: [{ max_value: 29.9, min_value: 10, type: 'Height', unit: 'cm' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('2-3');
    });

    it('buckets medium exactly at the small/medium threshold', () => {
      const facts = resolveCareFacts(
        buildDetails({
          dimensions: [{ max_value: 30, min_value: 10, type: 'Height', unit: 'cm' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('2-4');
    });

    it('buckets medium just under the medium/large threshold', () => {
      const facts = resolveCareFacts(
        buildDetails({
          dimensions: [{ max_value: 99.9, min_value: 10, type: 'Height', unit: 'cm' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('2-4');
    });

    it('buckets large exactly at the medium/large threshold', () => {
      const facts = resolveCareFacts(
        buildDetails({
          dimensions: [{ max_value: 100, min_value: 10, type: 'Height', unit: 'cm' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('3-5');
    });

    it('converts non-cm units before bucketing', () => {
      const facts = resolveCareFacts(
        buildDetails({
          // 40 inches ≈ 101.6cm — should land in the large bucket, not medium.
          dimensions: [{ max_value: 40, min_value: 10, type: 'Height', unit: 'inch' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('3-5');
    });

    it('falls back to medium when there are no dimensions', () => {
      const facts = resolveCareFacts(buildDetails({ dimensions: null }));
      expect(facts.potSizeRecommendationCm).toBe('2-4');
    });

    it('does not throw when a real Perenual response has a null type/unit/max_value (e.g. parlor palm)', () => {
      expect(() =>
        resolveCareFacts(
          buildDetails({
            dimensions: [{ max_value: null, min_value: null, type: null, unit: null }],
          }),
        ),
      ).not.toThrow();
    });

    it('treats a dimension with a null type as the fallback entry rather than throwing', () => {
      const facts = resolveCareFacts(
        buildDetails({
          dimensions: [{ max_value: 15, min_value: 5, type: null, unit: 'cm' }],
        }),
      );
      expect(facts.potSizeRecommendationCm).toBe('2-3');
    });
  });

  describe('repottingScheduleYears', () => {
    it.each([
      ['High', '1-2'],
      ['Moderate', '2-3'],
      ['Low', '3-4'],
    ] as const)('maps growth_rate %s to %s years', (growthRate, expected) => {
      const facts = resolveCareFacts(buildDetails({ growth_rate: growthRate }));
      expect(facts.repottingScheduleYears).toBe(expected);
    });

    it('falls back to the default bucket when growth_rate is null', () => {
      const facts = resolveCareFacts(buildDetails({ growth_rate: null }));
      expect(facts.repottingScheduleYears).toBe('2-3');
    });

    it('falls back to the default bucket for an unrecognized growth_rate', () => {
      const facts = resolveCareFacts(buildDetails({ growth_rate: 'Extreme' }));
      expect(facts.repottingScheduleYears).toBe('2-3');
    });
  });

  it('carries poisonous_to_pets through unchanged', () => {
    expect(resolveCareFacts(buildDetails({ poisonous_to_pets: true })).isToxicToPets).toBe(true);
    expect(resolveCareFacts(buildDetails({ poisonous_to_pets: false })).isToxicToPets).toBe(false);
  });

  describe('lightNeed', () => {
    it('buckets an explicit shade mention as low', () => {
      expect(resolveCareFacts(buildDetails({ sunlight: ['part shade'] })).lightNeed).toBe('low');
    });

    it('is case-insensitive when matching shade', () => {
      expect(resolveCareFacts(buildDetails({ sunlight: ['Full Shade'] })).lightNeed).toBe('low');
    });

    it('buckets a non-shade condition as bright', () => {
      expect(resolveCareFacts(buildDetails({ sunlight: ['full sun'] })).lightNeed).toBe('bright');
    });

    it('falls back to bright when sunlight is null', () => {
      expect(resolveCareFacts(buildDetails({ sunlight: null })).lightNeed).toBe('bright');
    });
  });
});
