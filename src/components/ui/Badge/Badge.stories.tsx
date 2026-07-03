import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { Badge } from './Badge';

const meta = {
  title: 'Spec/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const A_All: Story = {
  name: 'All',
  render: () => (
    <View style={styles.row}>
      <Badge icon="water" variant="default" />
      <Badge icon="water" variant="inverted" />
      <Badge count={3} variant="alert" size="small" />
    </View>
  ),
};

export const B_Default: Story = {
  name: 'Default',
  args: {
    icon: 'water',
    variant: 'default',
  },
};

export const C_Inverted: Story = {
  name: 'Inverted',
  args: {
    icon: 'water',
    variant: 'inverted',
  },
};

export const D_Alert: Story = {
  name: 'Alert',
  args: {
    count: 3,
    size: 'small',
    variant: 'alert',
  },
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
