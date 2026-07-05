import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { startGridImageItems } from '../../../assets/start';

const START_GRID_WIDTH = 327;
const START_GRID_ITEM_SIZE = 106;
const START_GRID_GAP = 4;
const START_GRID_IMAGE_RADIUS = 48;

export function StartScreenAssets() {
  return (
    <View style={styles.grid}>
      {startGridImageItems.map(item => (
        <Image key={item.id} source={item.source} style={styles.image} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: START_GRID_GAP,
    width: START_GRID_WIDTH,
  },
  image: {
    borderRadius: START_GRID_IMAGE_RADIUS,
    height: START_GRID_ITEM_SIZE,
    width: START_GRID_ITEM_SIZE,
  },
});
