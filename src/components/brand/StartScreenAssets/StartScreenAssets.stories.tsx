import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { startGridImages } from '../../../assets/start';
import { radii, spacing } from '../../../theme';

const meta = {
  title: 'Screens/StartScreenAssets',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ImageGrid: Story = {
  render: () => (
    <View style={styles.grid}>
      {startGridImages.map((source, index) => (
        <Image
          key={index}
          source={source}
          resizeMode="cover"
          style={styles.tile}
        />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    width: 327,
  },
  tile: {
    borderRadius: radii.photo,
    height: 106,
    width: 106.333,
  },
});
