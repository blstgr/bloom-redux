import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { Button } from '../Button';
import { NavBar as NavBarComponent, type NavItem } from '../NavBar';

import { BottomActions } from './BottomActions';

// The design system does not depend on any feature. This story used the real WateringSlider,
// inverting the ui <- features direction so a change inside a feature could break a BottomActions
// story. A plain stand-in demonstrates the slot just as well: what BottomActions does is position
// whatever it is handed, not know what that is.
function DemoBottomBar() {
  return <View style={styles.demoBottomBar} />;
}

// Tab-only nav: home + water.
const tabItems: NavItem[] = [
  { key: 'home', icon: 'home' },
  { key: 'watering', icon: 'water', badgeCount: 3 },
];

// Tabs respond to taps; clicking the active tab deselects it.
function InteractiveNavBar({ items, initialKey }: { items: NavItem[]; initialKey?: string }) {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(initialKey);
  const interactive = items.map(item => ({
    ...item,
    onPress: () =>
      setActiveKey(prev => prev === item.key ? undefined : item.key),
  }));
  return <NavBarComponent activeKey={activeKey} items={interactive} />;
}

const meta = {
  title: 'Spec/BottomActions',
  component: BottomActions,
} satisfies Meta<typeof BottomActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _01_All: Story = {
  name: 'All',
  render: () => (
    <View style={styles.centerStack}>
      <BottomActions
        bottomBar={<Button accessibilityLabel="Create item" icon="circle" iconOnly iconSize={sizes.icon.xl} variant="primary" />}
      />
      <BottomActions bottomBar={<DemoBottomBar />} />
      <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
    </View>
  ),
};

export const _02_Action: Story = {
  name: 'Action',
  render: () => (
    <BottomActions
      bottomBar={<Button accessibilityLabel="Create item" icon="circle" iconOnly iconSize={sizes.icon.xl} variant="primary" />}
    />
  ),
};

export const _03_Slider: Story = {
  name: 'Slider',
  render: () => (
    <BottomActions bottomBar={<DemoBottomBar />} />
  ),
};

export const _04_NavBar: Story = {
  name: 'Nav Bar',
  render: () => (
    <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
  ),
};

const styles = StyleSheet.create({
  demoBottomBar: {
    backgroundColor: colors.surface.peachDark,
    borderRadius: radii.pill,
    height: sizes.nav.item,
  },
  centerStack: {
    alignItems: 'center',
    gap: spacing.xl,
    width: '100%',
  },
});
