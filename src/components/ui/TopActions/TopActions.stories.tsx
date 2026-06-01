import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { AppText } from '../AppText';
import { EditableTitle } from '../EditableTitle';
import { IconButton } from '../IconButton';
import { TopActions } from './TopActions';

const meta = {
  title: 'Spec/TopActions',
  component: TopActions,
} satisfies Meta<typeof TopActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TopActions leftAction={<IconButton icon="close" />} rightAction={<IconButton icon="more" />} />,
};

export const WithTitle: Story = {
  render: () => <TopActions leftAction={<IconButton icon="close" />} rightAction={<IconButton icon="more" />} title={<AppText variant="title">Plant</AppText>} />,
};

export const WithEditableTitle: Story = {
  render: () => {
    const [value, setValue] = React.useState('ZZ plant');
    return (
      <TopActions
        leftAction={<IconButton icon="close" />}
        rightAction={<IconButton icon="more" />}
        title={<EditableTitle value={value} onChange={setValue} />}
      />
    );
  },
};

export const OnlyRightAction: Story = {
  render: () => <TopActions rightAction={<IconButton icon="more" />} />,
};

export const OnlyLeftAction: Story = {
  render: () => <TopActions leftAction={<IconButton icon="close" />} />,
};

export const Hero: Story = {
  render: () => (
    <TopActions
      mode="hero"
      rightAction={<IconButton icon="more" />}
      title={<AppText variant="hero">Plant</AppText>}
    />
  ),
};

export const All: Story = {
  render: () => {
    const [value, setValue] = React.useState('ZZ plant');
    return (
      <View style={styles.stack}>
        <TopActions leftAction={<IconButton icon="close" />} rightAction={<IconButton icon="more" />} />
        <TopActions leftAction={<IconButton icon="close" />} rightAction={<IconButton icon="more" />} title={<AppText variant="title">Plant</AppText>} />
        <TopActions leftAction={<IconButton icon="close" />} rightAction={<IconButton icon="more" />} title={<EditableTitle value={value} onChange={setValue} />} />
        <TopActions rightAction={<IconButton icon="more" />} />
        <TopActions leftAction={<IconButton icon="close" />} />
        <TopActions mode="hero" rightAction={<IconButton icon="more" />} title={<AppText variant="hero">Plant</AppText>} />
      </View>
    );
  },
};

const styles = StyleSheet.create({ stack: { gap: spacing.xl } });
