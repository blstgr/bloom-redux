import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, radii, sizes } from '../../../theme';
import { GLASS_BUTTON_ACTIVE_OPACITY } from '../Button';
import { Icon, type IconName } from '../Icon';

export type NavBarItemProps = {
  accessibilityLabel?: string;
  active?: boolean;
  icon: IconName;
  onPress?: () => void;
};

export function NavBarItem({
  accessibilityLabel,
  active = false,
  icon,
  onPress,
}: NavBarItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={GLASS_BUTTON_ACTIVE_OPACITY}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.item, active && styles.active]}>
      <Icon name={icon} color={active ? colors.icon.inverse : colors.icon.primary} size={sizes.icon.md} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: colors.action.primary,
  },
  item: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: sizes.nav.item,
    justifyContent: 'center',
    width: sizes.nav.item,
  },
});
