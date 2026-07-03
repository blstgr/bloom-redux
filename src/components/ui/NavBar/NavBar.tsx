import React from 'react';
import { StyleSheet, View, type LayoutRectangle, type StyleProp, type ViewStyle } from 'react-native';

import { sizes, spacing } from '../../../theme';
import { Badge } from '../Badge';
import { type IconName } from '../Icon';
import { SegmentedBarBase } from '../SegmentedBarBase';

import { NavBarItem } from './NavBarItem';

export type NavItem = {
  accessibilityLabel?: string;
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
  const itemLayouts = React.useRef<Record<string, LayoutRectangle>>({});
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  return (
    <View style={[styles.wrap, style]}>
      <SegmentedBarBase>
        {items.map(item => (
          // Only tab behaviors participate in selected/active visual state.
          <View
            key={item.key}
            onLayout={e => {
              itemLayouts.current[item.key] = e.nativeEvent.layout;
              if (item.badgeCount) forceUpdate();
            }}>
            <NavBarItem
              accessibilityLabel={item.accessibilityLabel ?? item.key}
              active={
                item.behavior !== 'route' && (
                  item.key === activeKey || item.behavior === 'submit'
                )
              }
              icon={item.icon}
              onPress={item.onPress}
            />
          </View>
        ))}
      </SegmentedBarBase>
      {/*
       * Badges are rendered in a separate overlay layer so the segmented container
       * can keep overflow clipping for rounded corners without clipping badge bubbles.
       * Positions are measured via onLayout on each item wrapper rather than computed
       * from a fixed item width, so badge placement stays accurate if item sizes vary.
       */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {items.map(item => {
          if (!item.badgeCount) return null;
          const layout = itemLayouts.current[item.key];
          if (!layout) return null;
          return (
            <Badge
              key={`${item.key}-badge`}
              variant="count"
              label={`${item.badgeCount}`}
              style={{ ...styles.badge, left: layout.x + layout.width - sizes.nav.badge + spacing.xxs }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -sizes.nav.badgeOffset,
  },
  wrap: {
    alignSelf: 'center',
  },
});
