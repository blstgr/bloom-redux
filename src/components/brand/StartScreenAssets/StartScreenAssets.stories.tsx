import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';

import { StartScreenAssets } from './StartScreenAssets';

const meta = {
  title: 'Screens/StartScreenAssets',
  component: StartScreenAssets,
} satisfies Meta<typeof StartScreenAssets>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ImageGrid: Story = {
  render: () => <StartScreenAssets />,
};
