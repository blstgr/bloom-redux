import React from 'react';
import { StyleSheet } from 'react-native';

import { startGridImageItems } from '../../../assets/start';
import { PhotoGrid, PhotoGridItem } from '../../ui/PhotoGrid';

const START_SCREEN_ASSETS_GRID_COLUMNS = 3;
const START_SCREEN_ASSETS_GRID_MAX_WIDTH = 327;

export function StartScreenAssets() {
  return (
    <PhotoGrid
      columns={START_SCREEN_ASSETS_GRID_COLUMNS}
      maxWidth={START_SCREEN_ASSETS_GRID_MAX_WIDTH}
      style={styles.grid}>
      {startGridImageItems.map(item => (
        <PhotoGridItem key={item.id} source={item.source} />
      ))}
    </PhotoGrid>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'flex-start',
  },
});
