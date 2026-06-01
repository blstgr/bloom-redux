import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Icon, type IconName } from '../Icon';

export type BadgeVariant = 'default' | 'inverted' | 'alert' | 'count' | 'date' | 'icon';
export type BadgeSize = 'normal' | 'small';

export type BadgeProps = {
  count?: number;
  day?: string;
  icon?: IconName;
  label?: string;
  month?: string;
  size?: BadgeSize;
  style?: ViewStyle;
  variant?: BadgeVariant;
};

export function Badge({
  count,
  day,
  icon,
  label,
  month,
  size = 'normal',
  style,
  variant = 'default',
}: BadgeProps) {
  const normalizedVariant = normalizeVariant(variant);
  const countLabel = label ?? (typeof count === 'number' ? `${count}` : undefined);

  if (normalizedVariant === 'alert') {
    return (
      <View style={[styles.count, size === 'small' && styles.small, style]}>
        <AppText variant="small" tone="inverse">
          {countLabel ?? '3'}
        </AppText>
      </View>
    );
  }

  if (countLabel) {
    return (
      <View
        style={[
          styles.count,
          normalizedVariant === 'inverted' && styles.countInverted,
          size === 'small' && styles.small,
          style,
        ]}>
        <AppText variant="small" tone={normalizedVariant === 'inverted' ? 'primary' : 'inverse'}>
          {countLabel}
        </AppText>
      </View>
    );
  }

  if (variant === 'date') {
    return (
      <View style={[styles.date, style]}>
        <View style={styles.dateIcon}>
          <Icon name={icon ?? 'water'} size={16} />
        </View>
        <AppText align="center" variant="small" tone="inverse">
          {day}
        </AppText>
        <AppText align="center" variant="small" tone="inverse">
          {month}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.icon,
        normalizedVariant === 'inverted' && styles.iconInverted,
        size === 'small' && styles.small,
        style,
      ]}>
      <Icon
        name={icon ?? 'water'}
        size={size === 'small' ? 12 : 16}
        color={normalizedVariant === 'inverted' ? colors.icon.inverse : colors.icon.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    alignItems: 'center',
    backgroundColor: colors.brand.orange,
    borderRadius: radii.pill,
    height: sizes.nav.badge,
    justifyContent: 'center',
    width: sizes.nav.badge,
  },
  countInverted: {
    backgroundColor: colors.surface.white,
  },
  date: {
    alignItems: 'center',
    backgroundColor: colors.surface.dark,
    borderRadius: radii.pill,
    gap: spacing.xxs,
    padding: spacing.xs,
  },
  dateIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: radii.pill,
    height: sizes.badge.md,
    justifyContent: 'center',
    width: sizes.badge.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: radii.pill,
    height: sizes.badge.md,
    justifyContent: 'center',
    width: sizes.badge.md,
  },
  iconInverted: {
    backgroundColor: colors.surface.dark,
  },
  small: {
    height: sizes.nav.badge,
    width: sizes.nav.badge,
  },
});

function normalizeVariant(variant: BadgeVariant): 'default' | 'inverted' | 'alert' {
  if (variant === 'icon' || variant === 'count') {
    return 'default';
  }

  if (variant === 'date') {
    return 'inverted';
  }

  return variant;
}
