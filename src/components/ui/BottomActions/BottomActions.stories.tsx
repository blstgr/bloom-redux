import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { Button } from '../Button';
import { NavBar as NavBarComponent } from '../NavBar';
import { BottomActions } from './BottomActions';

const navItems = [
  { key: 'home', icon: 'home' as const },
  { key: 'watering', icon: 'water' as const, badgeCount: 3 },
];

const navItemsWithRoute = [
  { key: 'home', icon: 'home' as const },
  { key: 'camera', icon: 'plus' as const, behavior: 'route' as const },
  { key: 'watering', icon: 'water' as const, badgeCount: 3 },
];

const navItemsWithSubmit = [
  { key: 'camera', icon: 'camera' as const, behavior: 'route' as const },
  { key: 'save', icon: 'check' as const, behavior: 'submit' as const },
];

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
      <BottomActions bottomBar={<Button icon="circle" label={undefined} preset="cameraShutter" variant="primary" />} />
      <BottomActions bottomBar={<NavBarComponent activeKey="home" items={navItems} />} />
      <BottomActions bottomBar={<NavBarComponent activeKey="home" items={navItemsWithRoute} />} />
      <BottomActions bottomBar={<NavBarComponent items={navItemsWithSubmit} />} />
    </View>
  ),
};

export const _02_ActionButton: Story = {
  name: 'Action Button',
  render: () => <BottomActions bottomBar={<Button icon="circle" label={undefined} preset="cameraShutter" variant="primary" />} />,
};

export const _03_ActionBar: Story = {
  name: 'Action Bar',
  render: () => <BottomActions bottomBar={<NavBarComponent items={navItemsWithSubmit} />} />,
};

export const _04_NavBar: Story = {
  name: 'Nav Bar',
  render: () => <BottomActions bottomBar={<NavBarComponent activeKey="home" items={navItemsWithRoute} />} />,
};

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
