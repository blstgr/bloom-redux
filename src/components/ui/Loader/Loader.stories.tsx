import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../../../theme';

import { Loader } from './Loader';

const meta = {
  title: 'Spec/Loader',
  component: Loader,
  args: {
    overlay: true,
  },
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: 'default', tone: 'onDark' },
  render: () => (
    <View style={[styles.preview, styles.dark]}>
      <Loader size="default" tone="onDark" />
    </View>
  ),
};

export const Inverted: Story = {
  args: { size: 'default', tone: 'onLight' },
  render: () => (
    <View style={[styles.preview, styles.light]}>
      <Loader size="default" tone="onLight" />
    </View>
  ),
};

export const Small: Story = {
  args: { size: 'small', tone: 'onLight' },
  render: () => (
    <View style={[styles.preview, styles.dark]}>
      <Loader size="small" tone="onDark" />
    </View>
  ),
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <View style={[styles.preview, styles.dark]}>
        <Loader size="default" tone="onDark" />
      </View>
      <View style={[styles.preview, styles.light]}>
        <Loader size="default" tone="onLight" />
      </View>
      <View style={[styles.preview, styles.dark]}>
        <Loader size="small" tone="onDark" />
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  dark: {
    backgroundColor: colors.surface.dark,
  },
  light: {
    backgroundColor: colors.surface.white,
  },
  preview: {
    alignItems: 'center',
    borderRadius: radii.xxl,
    justifyContent: 'center',
    minHeight: 120,
    padding: spacing.md,
  },
  stack: {
    gap: spacing.md,
  },
});
