import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radii, sizes } from '../../../theme';
import { AppText } from '../AppText';
import { Icon, type IconName } from '../Icon';

export type BadgeVariant = 'default' | 'inverted' | 'alert' | 'count' | 'icon';
export type BadgeSize = 'normal' | 'small';

type BadgeBaseProps = {
  style?: ViewStyle;
};

type BadgeIconProps = BadgeBaseProps & {
  count?: never;
  icon?: IconName;
  label?: never;
  size?: never;
  variant?: 'default' | 'inverted' | 'icon';
};

type BadgeCountProps = BadgeBaseProps & {
  count?: number;
  icon?: never;
  label?: string;
  size?: BadgeSize;
  variant?: 'default' | 'inverted' | 'alert' | 'count';
};

export type BadgeProps = BadgeIconProps | BadgeCountProps;

export function Badge({
  count,
  icon,
  label,
  size = 'normal',
  style,
  variant = 'default',
}: BadgeProps) {
  const countLabel = label ?? (typeof count === 'number' ? `${count}` : undefined);

  if (variant === 'alert') {
    return (
      <View style={[styles.count, size === 'small' && styles.small, style]}>
        <AppText variant="bodyS" tone="inverse">
          {countLabel ?? '!'}
        </AppText>
      </View>
    );
  }

  if (countLabel) {
    const inverted = variant === 'inverted';
    return (
      <View
        style={[
          styles.count,
          inverted && styles.countInverted,
          size === 'small' && styles.small,
          style,
        ]}>
        <AppText variant="bodyS" tone={inverted ? 'primary' : 'inverse'}>
          {countLabel}
        </AppText>
      </View>
    );
  }

  // icon / default / inverted — circular icon badge
  const inverted = variant === 'inverted';

  return (
    <View
      style={[
        styles.icon,
        inverted && styles.iconInverted,
        style,
      ]}>
      <Icon
        name={icon ?? 'water'}
        size={sizes.icon.sm}
        color={inverted ? colors.icon.inverse : colors.icon.primary}
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
