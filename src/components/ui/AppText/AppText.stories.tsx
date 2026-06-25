import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AppText } from './AppText';

const meta = {
  title: 'Spec/AppText',
  component: AppText,
  args: { children: 'Sample text' },
} satisfies Meta<typeof AppText>;

export default meta;

type Story = StoryObj<typeof meta>;

// — Titles (display font, 4 sizes) —
export const TitleXl: Story = { args: { children: 'Plant Situation', variant: 'titleXl' } };
export const TitleL:  Story = { args: { children: 'Keep something alive', variant: 'titleL' } };
export const TitleM:  Story = { args: { children: 'ZZ plant', variant: 'titleM' } };
export const TitleS:  Story = { args: { children: 'Care instructions', variant: 'titleS' } };

// — Body (3 variations) —
export const Body:          Story = { args: { children: 'Likes bright indirect light and mild neglect.', variant: 'body' } };
export const BodyHighlight: Story = { args: { children: 'Water every 14 days', variant: 'bodyHighlighted' } };
export const BodyS:         Story = { args: { children: '15 May', variant: 'bodyS' } };

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <AppText variant="titleXl">Plant Situation</AppText>
      <AppText variant="titleL">Keep something alive</AppText>
      <AppText variant="titleM">ZZ plant</AppText>
      <AppText variant="titleS">Care instructions</AppText>
      <AppText variant="body">Likes bright indirect light and mild neglect.</AppText>
      <AppText variant="bodyHighlighted">Water every 14 days</AppText>
      <AppText variant="bodyS">15 May</AppText>
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    width: 320,
  },
});
