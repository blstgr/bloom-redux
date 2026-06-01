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
    plantId: 'plant-1',
  },
} satisfies Meta<typeof PlantCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBadge: Story = {
  args: {
    badge: { icon: 'water', variant: 'badge' },
  },
};

export const WithBadgePill: Story = {
  args: {
    badge: { icon: 'water', label: '15 May', variant: 'badgePill' },
  },
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <PlantCard image={require('../../../assets/start/start-grid-01.jpg')} plantId="plant-1" />
      <PlantCard
        badge={{ icon: 'water', variant: 'badge' }}
        image={require('../../../assets/start/start-grid-02.jpg')}
        plantId="plant-2"
      />
      <PlantCard
        badge={{ icon: 'water', label: '15 May', variant: 'badgePill' }}
        image={require('../../../assets/start/start-grid-03.jpg')}
        plantId="plant-3"
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
