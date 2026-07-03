import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { layout, spacing } from '../../../theme';

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

const iconRows: IconName[][] = [
  ['camera', 'check', 'circle', 'close', 'dropHappy', 'dropSad', 'edit'],
  ['flash', 'flashOff', 'google', 'home', 'info', 'more', 'plant'],
  ['plus', 'schedule', 'trash', 'water'],
];

export const All: Story = {
  render: () => (
    <View style={styles.sheet}>
      <View style={styles.sizeRow}>
        <Icon name="home" size="md" />
        <Icon name="home" size="lg" />
        <Icon name="home" size="xl" />
        <Icon name="home" size="xxl" />
      </View>
      {iconRows.map(row => (
        <View key={`all-row-${row.join('-')}`} style={styles.row}>
          {row.map(name => (
            <View key={name} style={styles.item}>
              <Icon name={name} />
            </View>
          ))}
        </View>
      ))}
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
    <View style={styles.sheet}>
      {iconRows.map(row => (
        <View key={`row-${row.join('-')}`} style={styles.row}>
          {row.map(name => (
            <View key={name} style={styles.item}>
              <Icon name={name} />
            </View>
          ))}
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sheet: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    width: '100%',
  },
  sizeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
