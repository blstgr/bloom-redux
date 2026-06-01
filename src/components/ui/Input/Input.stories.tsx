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
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
});
