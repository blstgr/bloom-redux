import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';

import { Icon, type IconName } from './Icon';

const meta = {
  title: 'Spec/Icon',
  component: Icon,
  args: {
    name: 'home',
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

const names: IconName[] = [
  'camera',
  'check',
  'circle',
  'close',
  'dropHappy',
  'dropSad',
  'edit',
  'flash',
  'flashOff',
  'google',
  'home',
  'info',
  'more',
  'plant',
  'plus',
  'schedule',
  'trash',
  'water',
];

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Icon name="home" size="md" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="lg" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="xl" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="xxl" />
        </View>
      </View>
      <View style={styles.grid}>
        {names.map(name => (
          <View key={name} style={styles.item}>
            <Icon name={name} />
          </View>
        ))}
      </View>
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={styles.sizeRow}>
      <Icon name="home" size="md" />
      <Icon name="home" size="lg" />
      <Icon name="home" size="xl" />
      <Icon name="home" size="xxl" />
    </View>
  ),
};

export const Icons: Story = {
  render: () => (
    <View style={styles.grid}>
      {names.map(name => (
        <View key={name} style={styles.item}>
          <Icon name={name} />
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    columnGap: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.md,
    width: '100%',
  },
  stack: {
    gap: spacing.lg,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  sizeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
});
