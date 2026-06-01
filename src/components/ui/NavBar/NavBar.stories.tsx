import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { View } from 'react-native';

import { spacing } from '../../../theme';

import { NavBar } from './NavBar';

const defaultItems = [
  { key: 'home', icon: 'home' as const },
  { key: 'watering', icon: 'water' as const, badgeCount: 3 },
];

const meta = {
  title: 'Spec/NavBar',
  component: NavBar,
  args: {
    activeKey: 'home',
    items: defaultItems,
  },
} satisfies Meta<typeof NavBar>;

export default meta;

type Story = StoryObj<typeof meta>;

function DefaultNavBarDemo() {
  const [activeKey, setActiveKey] = React.useState<'home' | 'watering'>('home');
  return (
    <NavBar
      activeKey={activeKey}
      items={[
        { key: 'home', icon: 'home', behavior: 'tab', onPress: () => setActiveKey('home') },
        { key: 'watering', icon: 'water', behavior: 'tab', badgeCount: 3, onPress: () => setActiveKey('watering') },
      ]}
    />
  );
}

function NavBarWithActionDemo() {
  const [activeKey, setActiveKey] = React.useState<'home' | 'watering'>('home');
  return (
    <NavBar
      activeKey={activeKey}
      items={[
        { key: 'home', icon: 'home', behavior: 'tab', onPress: () => setActiveKey('home') },
        {
          key: 'camera',
          icon: 'plus',
          behavior: 'route',
          onPress: () => Alert.alert('Camera', 'Launch camera action'),
        },
        { key: 'watering', icon: 'water', behavior: 'tab', badgeCount: 3, onPress: () => setActiveKey('watering') },
      ]}
    />
  );
}

function NavBarWithSubmitDemo() {
  return (
    <NavBar
      activeKey="save"
      items={[
        { key: 'camera', icon: 'camera', behavior: 'route', onPress: () => Alert.alert('Camera', 'Open camera screen') },
        { key: 'save', icon: 'check', behavior: 'tab', onPress: () => Alert.alert('Save', 'Save plant action') },
      ]}
    />
  );
}

export const Default: Story = {
  render: () => <DefaultNavBarDemo />,
};

export const WithAction: Story = {
  name: 'With Action',
  render: () => <NavBarWithActionDemo />,
};

export const WithSubmit: Story = {
  name: 'With Submit',
  render: () => <NavBarWithSubmitDemo />,
};

export const All: Story = {
  render: () => (
    <View style={{ gap: spacing.xl }}>
      <DefaultNavBarDemo />
      <NavBarWithActionDemo />
      <NavBarWithSubmitDemo />
    </View>
  ),
};
