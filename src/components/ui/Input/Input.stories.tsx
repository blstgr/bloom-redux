import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { Input } from './Input';

const meta = {
  title: 'Spec/Input',
  component: Input,
  args: {
    label: 'Email',
    onChangeText: () => {},
    placeholder: 'plantkiller@gmail.com',
    type: 'email',
    value: 'plantkiller@gmail.com',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const A_All: Story = {
  name: 'All',
  render: () => <InteractiveInput />,
};

export const B_Default: Story = {
  name: 'Default',
  args: {
    label: 'Email',
    onChangeText: () => {},
    placeholder: 'plantkiller@gmail.com',
    type: 'email',
    value: 'plantkiller@gmail.com',
  },
};

export const C_Error: Story = {
  name: 'Error',
  args: {
    error: 'This is not an email',
    label: 'Email',
    onChangeText: () => {},
    placeholder: 'plantkiller@gmail.com',
    type: 'email',
    value: 'plantkiller@',
  },
};

export const D_Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    label: 'Email',
    onChangeText: () => {},
    placeholder: 'plantkiller@gmail.com',
    type: 'email',
    value: 'plantkiller@gmail.com',
  },
};

export const E_Large: Story = {
  name: 'Large',
  args: {
    accessibilityLabel: 'Search plants',
    actions: [
      {
        accessibilityLabel: 'Open camera',
        icon: 'camera',
        key: 'open-camera',
        onPress: () => {},
      },
    ],
    label: undefined,
    leadingIcon: 'search',
    onChangeText: () => {},
    placeholder: undefined,
    size: 'large',
    type: 'text',
    value: 'ZZ',
  },
};

function InteractiveInput() {
  const [value, setValue] = React.useState('plantkiller@gmail.com');

  return (
    <View style={styles.stack}>
      <Input
        label="Email"
        onChangeText={setValue}
        placeholder="plantkiller@gmail.com"
        type="email"
        value={value}
      />
      <Input
        error="This is not an email"
        label="Email"
        onChangeText={() => {}}
        placeholder="plantkiller@gmail.com"
        type="email"
        value="plantkiller@"
      />
      <Input
        disabled
        label="Email"
        onChangeText={() => {}}
        placeholder="plantkiller@gmail.com"
        type="email"
        value="plantkiller@gmail.com"
      />
      <Input
        accessibilityLabel="Search plants"
        actions={[
          {
            accessibilityLabel: 'Open camera',
            icon: 'camera',
            key: 'open-camera',
            onPress: () => {},
          },
        ]}
        leadingIcon="search"
        onChangeText={() => {}}
        value=""
      />
      <Input
        accessibilityLabel="Search plants"
        actions={[
          {
            accessibilityLabel: 'Clear search',
            icon: 'close',
            key: 'clear-search',
            onPress: () => {},
          },
          {
            accessibilityLabel: 'Open camera',
            icon: 'camera',
            key: 'open-camera',
            onPress: () => {},
          },
        ]}
        leadingIcon="search"
        onChangeText={() => {}}
        value="ZZ plant"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
});
