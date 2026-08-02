import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, fontFamilies, radii, spacing } from '../../../theme';
import { AppText } from '../AppText';

// Vertical padding + the body variant's line height (typography.body.lineHeight, 26) sum to the
// Figma spec's 32px badge height, rather than a separately hardcoded height.
const TAB_VERTICAL_PADDING = 3;

export type TabItem = {
  key: string;
  label: string;
};

export type TabsProps = {
  activeKey: string;
  onTabPress: (key: string) => void;
  tabs: TabItem[];
};

export function Tabs({ activeKey, onTabPress, tabs }: TabsProps) {
  return (
    <ScrollView
      accessibilityRole="tablist"
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}>
      {tabs.map(tab => {
        const isActive = tab.key === activeKey;

        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabPress(tab.key)}
            style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}>
            <AppText style={styles.tabLabel} tone={isActive ? 'inverse' : 'primary'} variant="body">
              {tab.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  scroll: {
    flexGrow: 0,
  },
  tab: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: TAB_VERTICAL_PADDING,
  },
  tabActive: {
    backgroundColor: colors.surface.dark,
  },
  tabInactive: {
    backgroundColor: colors.surface.white,
  },
  // Figma specs Satoshi Black for this label; only Satoshi-Medium and Satoshi-Bold are bundled in
  // this project, so Bold is the closest available match — kept as a style override rather than a
  // new AppText variant since no other text in the app uses this size/weight combination.
  tabLabel: {
    fontFamily: fontFamilies.bodyBold,
  },
});
