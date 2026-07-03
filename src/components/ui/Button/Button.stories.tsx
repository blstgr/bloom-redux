import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { Button } from './Button';

const meta = {
  title: 'Spec/Button',
  component: Button,
  args: {
    label: 'Continue',
    layout: 'hug',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  name: 'All',
  render: () => (
    <ScrollView>
      <View style={styles.allStack}>
        <Button label="Continue" layout="hug" variant="primary" />
        <Button label="Continue" layout="hug" variant="secondary" />
        <Button label="Continue" size="small" variant="secondary" />
        <Button icon="google" label="Continue with Google" layout="hug" variant="secondary" />
        <Button accessibilityLabel="Add item" icon="plus" iconOnly />
        <Button icon="google" label="Continue with Google" layout="fill" />
        <Button label="Continue" layout="fill" loading variant="secondary" />
        <View style={styles.row}>
          <Button accessibilityLabel="Add item" icon="plus" loading variant="primary" />
          <Button accessibilityLabel="Add item small" icon="plus" loading size="small" variant="secondary" />
        </View>
        <View style={styles.row}>
          <Button disabled label="Continue" layout="hug" variant="primary" />
          <Button disabled label="Continue" layout="hug" variant="secondary" />
        </View>
      </View>
    </ScrollView>
  ),
};

export const B_Primary: Story = {
  name: 'Primary',
  render: () => (
    <View style={styles.stack}>
      <Button label="Continue" layout="hug" variant="primary" />
    </View>
  ),
};

export const C_Secondary: Story = {
  name: 'Secondary',
  render: () => (
    <View style={styles.stack}>
      <Button label="Continue" layout="hug" variant="secondary" />
    </View>
  ),
};

export const D_Small: Story = {
  name: 'Small',
  render: () => (
    <View style={styles.stack}>
      <Button label="Continue" layout="hug" size="small" variant="secondary" />
    </View>
  ),
};

export const E_WithIcon: Story = {
  name: 'With icon',
  render: () => (
    <View style={styles.stack}>
      <Button icon="google" label="Continue with Google" layout="hug" variant="secondary" />
    </View>
  ),
};

export const F_IconOnly: Story = {
  name: 'Icon only',
  render: () => (
    <View style={styles.stack}>
      <Button accessibilityLabel="Add item" icon="plus" iconOnly />
    </View>
  ),
};

export const G_FillLayout: Story = {
  name: 'Fill layout',
  render: () => (
    <View style={styles.fillStack}>
      <Button icon="google" label="Continue with Google" layout="fill" variant="primary" />
    </View>
  ),
};

export const H_Loading: Story = {
  name: 'Loading',
  render: () => (
    <View style={styles.fillStack}>
      <Button label="Continue" layout="fill" loading variant="secondary" />
      <View style={styles.row}>
        <Button accessibilityLabel="Add item" icon="plus" loading variant="primary" />
        <Button accessibilityLabel="Add item small" icon="plus" loading size="small" variant="secondary" />
      </View>
    </View>
  ),
};

export const I_Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <View style={styles.row}>
      <Button disabled label="Continue" layout="hug" variant="primary" />
      <Button disabled label="Continue" layout="hug" variant="secondary" />
    </View>
  ),
};

const styles = StyleSheet.create({
  allStack: {
    alignItems: 'flex-start',
    gap: spacing.md,
    width: '100%',
  },
  stack: {
    alignItems: 'flex-start',
    gap: spacing.md,
    width: 320,
  },
  fillStack: {
    gap: spacing.md,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
