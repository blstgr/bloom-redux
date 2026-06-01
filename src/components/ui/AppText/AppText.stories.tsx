import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AppText } from './AppText';

const meta = {
  title: 'Spec/AppText',
  component: AppText,
  args: {
    children: 'Plant Situation',
  },
} satisfies Meta<typeof AppText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    children: 'Plant Situation',
    variant: 'h1',
  },
};

export const H2: Story = {
  args: {
    children: 'Keep something alive',
    variant: 'h2',
  },
};

export const H3: Story = {
  args: {
    children: 'ZZ plant',
    variant: 'h3',
  },
};

export const Body: Story = {
  args: {
    children: 'Likes bright indirect light and mild neglect.',
    variant: 'body',
  },
};

export const BodyHighlight: Story = {
  args: {
    children: 'Water every 14 days',
    variant: 'bodyHighlight',
  },
};

export const Small: Story = {
  args: {
    children: '15 May',
    variant: 'small',
  },
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <AppText variant="h1">Plant Situation</AppText>
      <AppText variant="h2">Keep something alive</AppText>
      <AppText variant="h3">ZZ plant</AppText>
      <AppText variant="body">Likes bright indirect light and mild neglect.</AppText>
      <AppText variant="bodyHighlight">Water every 14 days</AppText>
      <AppText variant="small">15 May</AppText>
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    width: 320,
  },
});
