import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { EditableTitle } from '../EditableTitle';
import { TopActions } from './TopActions';

const meta = {
  title: 'Spec/TopActions',
  component: TopActions,
} satisfies Meta<typeof TopActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const close = <Button icon="close" iconOnly size="small" variant="secondary" />;
const more = <Button icon="more" iconOnly size="small" variant="secondary" />;

export const Default: Story = {
  render: () => <TopActions leftAction={close} rightAction={more} />,
};

export const WithTitle: Story = {
  render: () => <TopActions leftAction={close} rightAction={more} title={<AppText variant="titleM">Plant</AppText>} />,
};

export const WithEditableTitle: Story = {
  render: () => {
    const [value, setValue] = React.useState('ZZ plant');
    return (
      <TopActions
        leftAction={close}
        rightAction={more}
        title={<EditableTitle value={value} onChange={setValue} />}
      />
    );
  },
};

export const OnlyRightAction: Story = {
  render: () => <TopActions rightAction={more} />,
};

export const OnlyLeftAction: Story = {
  render: () => <TopActions leftAction={close} />,
};

export const Hero: Story = {
  render: () => (
    <TopActions mode="hero" rightAction={more} title={<AppText variant="titleXl">Plant</AppText>} />
  ),
};

export const All: Story = {
  render: () => {
    const [value, setValue] = React.useState('ZZ plant');
    return (
      <View style={styles.stack}>
        <TopActions leftAction={close} rightAction={more} />
        <TopActions leftAction={close} rightAction={more} title={<AppText variant="titleM">Plant</AppText>} />
        <TopActions leftAction={close} rightAction={more} title={<EditableTitle value={value} onChange={setValue} />} />
        <TopActions rightAction={more} />
        <TopActions leftAction={close} />
        <TopActions mode="hero" rightAction={more} title={<AppText variant="titleXl">Plant</AppText>} />
      </View>
    );
  },
};

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
