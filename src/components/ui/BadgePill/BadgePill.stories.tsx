import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { BadgePill } from './BadgePill';

const meta = {
  title: 'Spec/BadgePill',
  component: BadgePill,
  args: {
    badgeVariant: 'light',
    icon: 'water',
    label: '15 May',
    variant: 'transparent',
  },
} satisfies Meta<typeof BadgePill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Transparent: Story = {};

export const Default: Story = {
  args: {
    badgeVariant: 'dark',
    variant: 'default',
  },
};

export const Inverted: Story = {
  args: {
    variant: 'inverted',
  },
};

export const All: Story = {
  render: () => (
    <View style={styles.row}>
      <BadgePill badgeVariant="dark" icon="water" label="15 May" variant="default" />
      <BadgePill badgeVariant="light" icon="water" label="15 May" variant="inverted" />
      <BadgePill badgeVariant="light" icon="water" label="15 May" variant="transparent" />
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
