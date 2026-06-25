import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../../theme';
import { AppText } from '../../../../components/ui/AppText';
import { BadgePill } from '../../../../components/ui/BadgePill/BadgePill';
import { Icon } from '../../../../components/ui/Icon';

export type ScheduleItem = {
  completed?: boolean;
  day: string;
  id: string;
  month: string;
};

export type WateringScheduleProps = {
  items: ScheduleItem[];
  title?: string;
};

export function WateringSchedule({
  items,
  title = 'Watering schedule',
}: WateringScheduleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Icon name="schedule" size={20} />
        <AppText variant="titleS">{title}</AppText>
      </View>
      <View style={styles.dates}>
        {items.map(item => (
          <BadgePill
            key={item.id}
            badgeVariant={item.completed ? 'dark' : 'light'}
            icon={item.completed ? 'check' : 'water'}
            label={`${item.day} ${item.month}`}
            variant="transparent"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    width: '100%',
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
});
