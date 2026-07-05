import type { OwnedPlant, PlantSpecies } from './mockPlants';

export type PlantScheduleItem = {
  completed?: boolean;
  day: string;
  id: string;
  month: string;
};

const DEFAULT_SCHEDULE_ITEM_COUNT = 7;
const FIRST_SCHEDULE_INDEX = 0;
// Watering before half the interval has elapsed risks waterlogged soil for most houseplants.
const TOO_SOON_INTERVAL_RATIO = 0.5;

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isCalendarDayOnOrBefore(a: Date, b: Date) {
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());

  return aDay.getTime() <= bDay.getTime();
}

function formatScheduleDate(date: Date) {
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function getTooSoonDate(lastWateredDate: Date, intervalDays: number) {
  return addDays(lastWateredDate, Math.ceil(intervalDays * TOO_SOON_INTERVAL_RATIO));
}

function getScheduleOffsetDays(index: number, intervalDays: number) {
  return index * intervalDays;
}

export function getScheduleBaseDate(ownedPlant: OwnedPlant): Date {
  const lastWateredAt = ownedPlant.wateringHistory.at(-1);
  return new Date(lastWateredAt ?? ownedPlant.addedAt);
}

export function buildPlantSchedule(
  ownedPlant: OwnedPlant,
  species: PlantSpecies,
  count = DEFAULT_SCHEDULE_ITEM_COUNT,
): PlantScheduleItem[] {
  const lastWateredAt = ownedPlant.wateringHistory.at(-1);
  const baseDate = getScheduleBaseDate(ownedPlant);

  return Array.from({ length: count }, (_, index) => {
    const scheduleDate = addDays(
      baseDate,
      getScheduleOffsetDays(index, species.wateringIntervalDays),
    );
    const { day, month } = formatScheduleDate(scheduleDate);

    return {
      completed: index === FIRST_SCHEDULE_INDEX && Boolean(lastWateredAt),
      day,
      id: `${ownedPlant.ownedPlantId}-schedule-${index}`,
      month,
    };
  });
}

export function isWateredToday(ownedPlant: OwnedPlant, now = new Date()): boolean {
  const lastWateredAt = ownedPlant.wateringHistory.at(-1);
  if (!lastWateredAt) return false;

  return isSameCalendarDay(new Date(lastWateredAt), now);
}

export function isWateringTooSoon(
  ownedPlant: OwnedPlant,
  species: PlantSpecies,
  now = new Date(),
): boolean {
  const lastWateredAt = ownedPlant.wateringHistory.at(-1);
  if (!lastWateredAt) return false;

  return !isCalendarDayOnOrBefore(
    getTooSoonDate(new Date(lastWateredAt), species.wateringIntervalDays),
    now,
  );
}

export function isWateringDue(
  ownedPlant: OwnedPlant,
  species: PlantSpecies,
  now = new Date(),
): boolean {
  const lastWateredAt = ownedPlant.wateringHistory.at(-1);
  if (!lastWateredAt) {
    return isCalendarDayOnOrBefore(new Date(ownedPlant.addedAt), now);
  }

  const lastWateredDate = new Date(lastWateredAt);
  if (isSameCalendarDay(lastWateredDate, now)) return false;

  const dueDate = addDays(lastWateredDate, species.wateringIntervalDays);
  return isCalendarDayOnOrBefore(dueDate, now);
}
