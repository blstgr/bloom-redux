import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, radii, sizes } from '../../../theme';
import { Icon, type IconName } from '../Icon';

export type NavBarItemProps = {
  active?: boolean;
  icon: IconName;
  onPress?: () => void;
};

export function NavBarItem({ active = false, icon, onPress }: NavBarItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.item, active && styles.active]}>
      <Icon name={icon} color={active ? colors.icon.inverse : colors.icon.primary} />
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
