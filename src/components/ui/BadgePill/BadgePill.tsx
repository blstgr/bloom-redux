import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Badge } from '../Badge';
import { type IconName } from '../Icon';

export type BadgePillVariant = 'transparent' | 'inverted' | 'default';
export type BadgePillBadgeVariant = 'light' | 'dark';

export type BadgePillProps = {
  badgeVariant: BadgePillBadgeVariant;
  icon?: IconName;
  label: string;
  variant: BadgePillVariant;
};

export function BadgePill({ badgeVariant, icon = 'water', label, variant }: BadgePillProps) {
  const effectiveBadgeVariant =
    variant === 'inverted'
      ? 'light'
      : variant === 'default'
        ? 'dark'
        : badgeVariant;
  const badgeStyle = effectiveBadgeVariant === 'light' ? 'default' : 'inverted';

  const [firstPart, ...rest] = label.trim().split(' ');
  const secondPart = rest.join(' ');

  return (
    <View style={[styles.base, styles[variant]]}>
      <Badge icon={icon} variant={badgeStyle} />
      <AppText style={styles.label} variant="small" tone={variant === 'inverted' ? 'inverse' : 'primary'}>
        {secondPart ? `${firstPart}\n${secondPart}` : firstPart}
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
