import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AlertModal } from './AlertModal';

const meta = {
  title: 'Spec/AlertModal',
  component: AlertModal,
  args: {
    text: 'Uh no... something went wrong.',
    variant: 'error',
    visible: true,
  },
} satisfies Meta<typeof AlertModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {};

export const Info: Story = {
  args: {
    text: 'You already have a ZZ Plant. Save this one under a different name or discard.',
    variant: 'info',
  },
};

export const All: Story = {
  render: () => (
    <View style={styles.stack}>
      <AlertModal staticPreview text="Uh no... something went wrong." variant="error" visible />
      <AlertModal
        staticPreview
        text="You already have a ZZ Plant. Save this one under a different name or discard."
        variant="info"
        visible
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
    width: 224,
  },
});
