import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { sizes } from '../../../theme';
import { SegmentedBarBase } from '../SegmentedBarBase';
import { type IconName } from '../Icon';
import { NavBarItem } from './NavBarItem';

export type NavItem = {
  behavior?: 'route' | 'submit' | 'tab';
  badgeCount?: number;
  icon: IconName;
  key: string;
  onPress?: () => void;
};

export type NavBarProps = {
  activeKey?: string;
  items: NavItem[];
  style?: StyleProp<ViewStyle>;
};

export function NavBar({ activeKey, items, style }: NavBarProps) {
  return (
    <View style={[styles.wrap, style]}>
      <SegmentedBarBase>
        {items.map(item => (
          // Only tab behaviors participate in selected/active visual state.
          <NavBarItem
            key={item.key}
            active={item.behavior === 'tab' && item.key === activeKey}
            icon={item.icon}
            onPress={item.onPress}
          />
        ))}
      </SegmentedBarBase>
      {/*
       * Badges are rendered in a separate overlay layer so the segmented container
       * can keep overflow clipping for rounded corners without clipping badge bubbles.
       */}
      <View pointerEvents="box-none" style={styles.badgeLayer}>
        {items.map((item, index) =>
          item.badgeCount ? (
            <View key={`${item.key}-badge`} style={[styles.badgeSlot, { left: index * sizes.nav.item }]}>
              <NavBarItem.Badge count={item.badgeCount} />
            </View>
          ) : null,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeLayer: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
  },
  badgeSlot: {
    position: 'absolute',
    width: sizes.nav.item,
  },
  wrap: {
    alignSelf: 'center',
  },
});
