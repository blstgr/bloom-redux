import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { BottomActions } from '../BottomActions';
import { NavBar, type NavItem } from './NavBar';

const tabItems: NavItem[] = [
  { key: 'home',     icon: 'home',  behavior: 'tab' },
  { key: 'watering', icon: 'water', behavior: 'tab', badgeCount: 3 },
];

const tabWithRouteItems: NavItem[] = [
  { key: 'home',     icon: 'home',  behavior: 'tab'   },
  { key: 'camera',   icon: 'plus',  behavior: 'route' },
  { key: 'watering', icon: 'water', behavior: 'tab', badgeCount: 3 },
];

const routeSubmitItems: NavItem[] = [
  { key: 'camera', icon: 'camera', behavior: 'route'  },
  { key: 'save',   icon: 'check',  behavior: 'submit' },
];

function InteractiveNavBar({ items, initialKey }: { items: NavItem[]; initialKey?: string }) {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(initialKey);
  const interactive = items.map(item => ({
    ...item,
    onPress: item.behavior === 'tab'
      ? () => setActiveKey(prev => prev === item.key ? undefined : item.key)
      : item.onPress,
  }));
  return <NavBar activeKey={activeKey} items={interactive} />;
}

const meta = {
  title: 'Spec/NavBar',
  component: NavBar,
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _01_All: Story = {
  name: 'All',
  args: {} as never,
  render: () => (
    <View style={styles.stack}>
      <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
      <BottomActions bottomBar={<InteractiveNavBar items={tabWithRouteItems} initialKey="home" />} />
      <BottomActions bottomBar={<NavBar items={routeSubmitItems} />} />
    </View>
  ),
};

export const _02_NavTab: Story = {
  name: 'Nav Tab',
  args: {} as never,
  render: () => (
    <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
  ),
};

export const _03_NavTabWithRoute: Story = {
  name: 'Nav Tab with Route',
  args: {} as never,
  render: () => (
    <BottomActions bottomBar={<InteractiveNavBar items={tabWithRouteItems} initialKey="home" />} />
  ),
};

export const _04_NavRouteWithAction: Story = {
  name: 'Nav Route with Action',
  args: {} as never,
  render: () => (
    <BottomActions bottomBar={<NavBar items={routeSubmitItems} />} />
  ),
};

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
