import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { radii, spacing } from '../../../theme';
import { Logo, LogoSymbol } from './Logo';

const meta = {
  title: 'Spec/Logo',
  component: Logo,
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {
  render: () => (
    <View style={styles.preview}>
      <Logo />
    </View>
  ),
};

export const Symbol: Story = {
  render: () => (
    <View style={styles.preview}>
      <LogoSymbol />
    </View>
  ),
};

export const SymbolInverted: Story = {
  render: () => (
    <View style={[styles.preview, styles.darkPreview]}>
      <LogoSymbol color="#FFFFFF" markColor="#4A8F57" />
    </View>
  ),
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <View style={styles.preview}>
        <Logo />
      </View>
      <View style={styles.preview}>
        <LogoSymbol />
      </View>
      <View style={[styles.preview, styles.darkPreview]}>
        <LogoSymbol color="#FFFFFF" markColor="#4A8F57" />
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    padding: spacing.xl,
    width: 320,
  },
  darkPreview: {
    backgroundColor: '#1B1A1A',
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  stack: {
    gap: spacing.md,
  },
});
