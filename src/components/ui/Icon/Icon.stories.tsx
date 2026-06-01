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
          <Icon name="home" size="normal" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="medium" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="large" />
        </View>
        <View style={styles.item}>
          <Icon name="home" size="xLarge" />
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
      <Icon name="home" size="normal" />
      <Icon name="home" size="medium" />
      <Icon name="home" size="large" />
      <Icon name="home" size="xLarge" />
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
    rowGap: spacing.md,
    width: 320,
  },
  stack: {
    gap: spacing.lg,
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
  },
});
