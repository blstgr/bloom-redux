import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { PlantCard } from './PlantCard';

const meta = {
  title: 'Spec/PlantCard',
  component: PlantCard,
  args: {
    image: require('../../../assets/start/start-grid-01.jpg'),
  },
} satisfies Meta<typeof PlantCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBadge: Story = {
  args: {
    badge: { icon: 'water', type: 'badge' },
  },
};

export const WithBadgePill: Story = {
  args: {
    badge: { icon: 'water', label: '15 May', type: 'pill' },
  },
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <PlantCard image={require('../../../assets/start/start-grid-01.jpg')} />
      <PlantCard
        badge={{ icon: 'water', type: 'badge' }}
        image={require('../../../assets/start/start-grid-02.jpg')}
      />
      <PlantCard
        badge={{ icon: 'water', label: '15 May', type: 'pill' }}
        image={require('../../../assets/start/start-grid-03.jpg')}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    width: 320,
  },
});
