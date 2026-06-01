import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';

import { WateringSlider } from './WateringSlider';

const meta = {
  title: 'Spec/WateringSlider',
  component: WateringSlider,
} satisfies Meta<typeof WateringSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <View><WateringSlider /></View>,
};
