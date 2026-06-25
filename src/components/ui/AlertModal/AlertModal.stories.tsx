import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { AlertModal } from './AlertModal';

const meta = {
  title: 'Spec/AlertModal',
  component: AlertModal,
} satisfies Meta<typeof AlertModal>;

export default meta;

type Story = StoryObj<typeof meta>;

// Opens on load (same as before). Tap backdrop to dismiss, button to re-open.
// The modal will cover Storybook nav while open — that's a RN Modal limitation.
function AlertDemo({ text, variant }: { text: string; variant: 'info' | 'error' }) {
  const [visible, setVisible] = React.useState(true);
  return (
    <View style={styles.demo}>
      <Button label="Show modal" variant="secondary" onPress={() => setVisible(true)} />
      <AlertModal
        text={text}
        variant={variant}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </View>
  );
}

export const Error: Story = {
  args: {} as never,
  render: () => (
    <AlertDemo text="Uh no... something went wrong." variant="error" />
  ),
};

export const Info: Story = {
  args: {} as never,
  render: () => (
    <AlertDemo
      text="You already have a ZZ Plant. Save this one under a different name or discard."
      variant="info"
    />
  ),
};

// Static card previews — both variants at once without a real Modal.
export const All: Story = {
  args: {} as never,
  render: () => (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Icon name="dropSad" color={colors.icon.inverse} />
        <AppText align="center" tone="inverse" variant="body">
          Uh no... something went wrong.
        </AppText>
      </View>
      <View style={styles.card}>
        <Icon name="info" color={colors.icon.inverse} />
        <AppText align="center" tone="inverse" variant="body">
          You already have a ZZ Plant. Save this one under a different name or discard.
        </AppText>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface.dark,
    borderRadius: radii.photo,
    gap: spacing.md,
    maxWidth: sizes.modal.maxWidth,
    padding: spacing.xxl,
  },
  demo: {
    alignItems: 'flex-start',
  },
  stack: {
    alignItems: 'center',
    gap: spacing.xl,
    width: '100%',
  },
});
