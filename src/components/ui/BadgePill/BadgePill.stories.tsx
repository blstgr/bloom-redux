import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { BadgePill } from './BadgePill';

const meta = {
  title: 'Spec/BadgePill',
  component: BadgePill,
  args: {
    day: '15',
    month: 'May',
    icon: 'water',
    variant: 'transparent',
  },
} satisfies Meta<typeof BadgePill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Transparent: Story = {
  args: { badgeVariant: 'light' },
};

export const Default: Story = {
  args: { variant: 'default' },
};

export const Inverted: Story = {
  args: { variant: 'inverted' },
};

export const All: Story = {
  render: () => (
    <View style={styles.row}>
      <BadgePill day="15" month="May" icon="water" variant="default" />
      <BadgePill day="15" month="May" icon="water" variant="inverted" />
      <BadgePill day="15" month="May" icon="water" badgeVariant="light" variant="transparent" />
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
