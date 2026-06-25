import React from 'react';
import { Image, StyleSheet, type ImageSourcePropType, type ImageStyle } from 'react-native';

import { colors, radii } from '../../../theme';

export type PhotoGridItemProps = {
  source: ImageSourcePropType;
  style?: ImageStyle;
};

export function PhotoGridItem({ source, style }: PhotoGridItemProps) {
  return <Image source={source} style={[styles.image, style]} />;
}

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1,
    backgroundColor: colors.surface.white,
    borderRadius: radii.photo,
    overflow: 'hidden',
    width: '100%',
  },
});
