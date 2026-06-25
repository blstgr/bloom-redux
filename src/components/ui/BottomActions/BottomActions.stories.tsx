import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { Button } from '../Button';
import { NavBar as NavBarComponent, type NavItem } from '../NavBar';
import { WateringSlider } from '../../../features/watering/components/WateringSlider';
import { BottomActions } from './BottomActions';

// Tab-only nav: home + water
const tabItems: NavItem[] = [
  { key: 'home',     icon: 'home',  behavior: 'tab' },
  { key: 'watering', icon: 'water', behavior: 'tab', badgeCount: 3 },
];

// Tabs respond to taps; clicking the active tab deselects it.
function InteractiveNavBar({ items, initialKey }: { items: NavItem[]; initialKey?: string }) {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(initialKey);
  const interactive = items.map(item => ({
    ...item,
    onPress: item.behavior === 'tab'
      ? () => setActiveKey(prev => prev === item.key ? undefined : item.key)
      : item.onPress,
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
    <View style={styles.stack}>
      <BottomActions bottomBar={<Button icon="circle" iconOnly iconSize={52} variant="primary" />} />
      <BottomActions bottomBar={<WateringSlider />} />
      <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
    </View>
  ),
};

export const _02_Action: Story = {
  name: 'Action',
  render: () => (
    <BottomActions bottomBar={<Button icon="circle" iconOnly iconSize={52} variant="primary" />} />
  ),
};

export const _03_Slider: Story = {
  name: 'Slider',
  render: () => (
    <BottomActions bottomBar={<WateringSlider />} />
  ),
};

export const _04_NavBar: Story = {
  name: 'Nav Bar',
  render: () => (
    <BottomActions bottomBar={<InteractiveNavBar items={tabItems} initialKey="home" />} />
  ),
};

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
