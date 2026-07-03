import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { spacing } from '../../../../theme';

import { WateringSchedule } from './WateringSchedule';

type PlantType = 'zz' | 'fern';

const PLANT_SCHEDULES: Record<PlantType, { intervalDays: number; label: string }> = {
  zz: { intervalDays: 14, label: 'ZZ Plant' },
  fern: { intervalDays: 1, label: 'Fern' },
};

const meta = {
  title: 'Spec/WateringSchedule',
  component: WateringSchedule,
} satisfies Meta<typeof WateringSchedule>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: [] },
  render: () => <ScheduleDemo />,
};

function ScheduleDemo() {
  const [plant, setPlant] = React.useState<PlantType>('zz');
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const [inputDate, setInputDate] = React.useState(formatInputDate(today));
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [completedByPlant, setCompletedByPlant] = React.useState<Record<PlantType, Date[]>>({
    fern: [],
    zz: [],
  });
  const schedule = PLANT_SCHEDULES[plant];
  const completedDates = completedByPlant[plant];

  const items = React.useMemo(
    () => buildItems({ completedDates, schedule, today }),
    [completedDates, schedule, today],
  );

  const handlePlant = React.useCallback(
    (nextPlant: PlantType) => {
      setPlant(nextPlant);
    },
    [],
  );

  const handleMarkCompleted = React.useCallback(() => {
    const parsed = parseInputDate(inputDate);
    // Keep the control strict: only valid calendar dates can be committed.
    if (!parsed) {
      setError('Time travel isn’t supported yet');
      return;
    }
    // Off-schedule completion can move forward only; past dates are disallowed.
    if (parsed < today) {
      setError('Time travel isn’t supported yet');
      return;
    }

    const lastCompletedNow = completedDates.length > 0 ? completedDates[completedDates.length - 1] : null;
    // Never allow rewriting history before the latest completed badge.
    if (lastCompletedNow && parsed < lastCompletedNow) {
      setError('Time travel isn’t supported yet');
      return;
    }

    setError(undefined);
    setCompletedByPlant(prev => {
      const currentPlantDates = prev[plant];
      if (currentPlantDates.length >= 7) return prev;
      const lastCompleted = currentPlantDates.length > 0 ? currentPlantDates[currentPlantDates.length - 1] : null;
      if (!lastCompleted) {
        return {
          ...prev,
          [plant]: [...currentPlantDates, parsed],
        };
      }

      const minNext = addDays(lastCompleted, schedule.intervalDays);
      const sameAsLast = parsed.getTime() === lastCompleted.getTime();
      // Repeating the same date means "next scheduled completion".
      const nextCompleted = sameAsLast ? minNext : parsed;
      if (sameAsLast) {
        setInputDate(formatInputDate(nextCompleted));
      }
      const updated = [...currentPlantDates, nextCompleted];
      // Rollover: when only one unchecked badge remains, keep only latest checked
      // as the anchor and let the rest regenerate as upcoming dates.
      const rolled = updated.length >= 6 ? [updated[updated.length - 1]] : updated;
      return {
        ...prev,
        [plant]: rolled,
      };
    });
  }, [completedDates, inputDate, plant, schedule.intervalDays, today]);

  return (
    <View style={styles.frame}>
      <View style={styles.stack}>
        <View style={styles.topRow}>
          <Button
            icon="repeat"
            iconOnly
            onPress={() => {
              setCompletedByPlant({ fern: [], zz: [] });
              setError(undefined);
              setInputDate(formatInputDate(today));
            }}
            size="small"
            variant="secondary"
          />
        </View>

        <View style={styles.inputBlock}>
          <Input
            error={error}
            label="Off-schedule date"
            labelIcon="schedule"
            onChangeText={setInputDate}
            placeholder="YYYY-MM-DD"
            type="text"
            value={inputDate}
          />
          <Button label="Mark completed" layout="fill" onPress={handleMarkCompleted} size="small" variant="secondary" />
        </View>

        <View style={styles.scheduleControls}>
          <View style={styles.row}>
            <View style={styles.halfButton}>
              <Button
                icon="schedule"
                label={PLANT_SCHEDULES.zz.label}
                layout="fill"
                onPress={() => handlePlant('zz')}
                size="small"
                variant={plant === 'zz' ? 'primary' : 'secondary'}
              />
            </View>
            <View style={styles.halfButton}>
              <Button
                icon="schedule"
                label={PLANT_SCHEDULES.fern.label}
                layout="fill"
                onPress={() => handlePlant('fern')}
                size="small"
                variant={plant === 'fern' ? 'primary' : 'secondary'}
              />
            </View>
          </View>

          <Button
            label="Mark completed"
            layout="fill"
            onPress={handleMarkCompleted}
            size="small"
            variant="secondary"
          />
        </View>

        <View style={styles.scheduleContainer}>
          <WateringSchedule items={items} />
        </View>
      </View>
    </View>
  );
}

function buildItems({
  completedDates,
  schedule,
  today,
}: {
  completedDates: Date[];
  schedule: { intervalDays: number };
  today: Date;
}) {
  const total = 7;
  const result: Array<{ completed?: boolean; day: string; id: string; month: string }> = [];
  const completedCount = completedDates.length;
  const base = completedCount > 0 ? completedDates[completedCount - 1] : today;

  for (let i = 0; i < total; i += 1) {
    let date: Date;
    let completed = false;
    if (i < completedCount) {
      date = completedDates[i];
      completed = true;
    } else {
      const step = completedCount > 0 ? i - completedCount + 1 : i;
      date = addDays(base, step * schedule.intervalDays);
    }
    result.push({
      completed,
      day: String(date.getDate()),
      id: `${date.toISOString()}-${i}`,
      month: formatMonth(date),
    });
  }

  return result;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  const raw = value.trim();
  let year: number;
  let month: number;
  let day: number;

  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (full) {
    year = Number(full[1]);
    month = Number(full[2]);
    day = Number(full[3]);
  } else {
    const short = /^(\d{2})-(\d{2})$/.exec(raw);
    if (!short) return null;
    year = new Date().getFullYear();
    month = Number(short[1]);
    day = Number(short[2]);
  }

  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
    width: '100%',
  },
  halfButton: {
    flex: 1,
  },
  inputBlock: {
    gap: spacing.xs,
  },
  scheduleControls: {
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stack: {
    flex: 1,
    width: '100%',
  },
  topRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    width: '100%',
  },
  scheduleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
