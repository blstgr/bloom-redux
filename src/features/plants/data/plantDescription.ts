export const PLANT_DESCRIPTION_MAX_CHARS = 180;

export type PlantDescriptionInput = {
  careNote: string;
  light: string;
  potSizeCm: string;
  repotYears: string;
  wateringIntervalDays: number;
};

export function buildPlantDescription({
  careNote,
  light,
  potSizeCm,
  repotYears,
  wateringIntervalDays,
}: PlantDescriptionInput) {
  const description = `Likes ${light} and ${careNote}. Water every ${wateringIntervalDays} days, use a pot with drainage holes ${potSizeCm} cm larger than roots, and repot every ${repotYears} years.`;

  if (description.length > PLANT_DESCRIPTION_MAX_CHARS) {
    throw new Error(
      `Plant description must be ${PLANT_DESCRIPTION_MAX_CHARS} characters or fewer.`,
    );
  }

  return description;
}
