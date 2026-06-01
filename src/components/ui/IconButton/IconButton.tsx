import React from 'react';
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { colors, radii, shadows, sizes } from '../../../theme';
import { GlassView } from '../GlassView';
import { Icon, type IconName } from '../Icon';

export type IconButtonVariant = 'primary' | 'secondary' | 'glass';

export type IconButtonProps = TouchableOpacityProps & {
  icon: IconName;
  size?: 'sm' | 'md';
  variant?: IconButtonVariant;
};

export function IconButton({
  icon,
  size = 'sm',
  variant = 'secondary',
  style,
  ...touchableProps
}: IconButtonProps) {
  const iconColor = variant === 'primary' ? colors.icon.inverse : colors.icon.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      style={[styles.base, styles[size], styles[variant], style]}
      {...touchableProps}>
      {variant !== 'primary' ? <GlassView style={styles.blurLayer} /> : null}
      <Icon name={icon} color={iconColor} size={24} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  blurLayer: {
    ...StyleSheet.absoluteFill,
  },
  glass: {
    backgroundColor: 'transparent',
    borderColor: colors.border.white,
  },
  md: {
    height: sizes.button.normal,
    width: sizes.button.normal,
  },
  primary: {
    backgroundColor: colors.action.primary,
    borderColor: colors.action.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.border.white,
  },
  sm: {
    height: sizes.button.small,
    width: sizes.button.small,
  },
});
