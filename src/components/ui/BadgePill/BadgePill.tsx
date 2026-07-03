import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Badge } from '../Badge';
import { type IconName } from '../Icon';

export type BadgePillVariant = 'transparent' | 'inverted' | 'default';
export type BadgePillBadgeVariant = 'light' | 'dark';

type BadgePillContent =
  | { label: string; day?: never; month?: never }
  | { day: string; month: string; label?: never };

type BadgePillVariantProps =
  | { variant: 'transparent'; badgeVariant?: BadgePillBadgeVariant }
  | { variant: 'inverted' | 'default'; badgeVariant?: never };

export type BadgePillProps = { icon?: IconName } & BadgePillContent & BadgePillVariantProps;

export function BadgePill({ badgeVariant, day, icon = 'water', label, month, variant }: BadgePillProps) {
  const effectiveBadgeVariant =
    variant === 'inverted' ? 'light'
    : variant === 'default' ? 'dark'
    : (badgeVariant ?? 'dark');
  const badgeStyle = effectiveBadgeVariant === 'light' ? 'default' : 'inverted';

  const parts = label?.trim().split(' ') ?? [];
  const line1 = day ?? parts[0] ?? '';
  const line2 = month ?? parts.slice(1).join(' ');

  return (
    <View style={[styles.base, styles[variant]]}>
      <Badge icon={icon} variant={badgeStyle} />
      <AppText style={styles.label} variant="bodyS" tone={variant === 'inverted' ? 'inverse' : 'primary'}>
        {line2 ? `${line1}\n${line2}` : line1}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.pill,
    gap: spacing.xs,
    padding: spacing.xs,
    width: sizes.badge.pill,
  },
  inverted: {
    backgroundColor: colors.surface.dark,
  },
  default: {
    backgroundColor: colors.surface.white,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  label: {
    textAlign: 'center',
  },
});
