import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AppText } from '../AppText';
import { EditableTitle } from '../EditableTitle';
import { TopActions } from './TopActions';

const meta = {
  title: 'Spec/TopActions',
  component: TopActions,
} satisfies Meta<typeof TopActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TopActions leftIcon="close" rightIcon="more" />,
};

export const WithTitle: Story = {
  render: () => <TopActions leftIcon="close" rightIcon="more" title={<AppText variant="titleM">Plant</AppText>} />,
};

export const WithEditableTitle: Story = {
  render: () => <WithEditableTitleDemo />,
};

export const OnlyRightAction: Story = {
  render: () => <TopActions rightIcon="more" />,
};

export const OnlyLeftAction: Story = {
  render: () => <TopActions leftIcon="close" />,
};

export const Hero: Story = {
  render: () => (
    <TopActions mode="hero" rightIcon="more" title={<AppText variant="titleXl">Plant</AppText>} />
  ),
};

export const All: Story = {
  render: () => <AllDemo />,
};

function WithEditableTitleDemo() {
  const [value, setValue] = React.useState('ZZ plant');
  return (
    <TopActions
      leftIcon="close"
      rightIcon="more"
      title={<EditableTitle value={value} onChange={setValue} />}
    />
  );
}

function AllDemo() {
  const [value, setValue] = React.useState('ZZ plant');
  return (
    <View style={styles.stack}>
      <TopActions leftIcon="close" rightIcon="more" />
      <TopActions leftIcon="close" rightIcon="more" title={<AppText variant="titleM">Plant</AppText>} />
      <TopActions leftIcon="close" rightIcon="more" title={<EditableTitle value={value} onChange={setValue} />} />
      <TopActions rightIcon="more" />
      <TopActions leftIcon="close" />
      <TopActions mode="hero" rightIcon="more" title={<AppText variant="titleXl">Plant</AppText>} />
    </View>
  );
}

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
