import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, layout, spacing } from '../../../../theme';

export type PlantDetailProps = {
  category: string;
  description: string;
  imageUrl: string;
  name: string;
};

const MAX_IMAGE_HEIGHT = 326;
const IMAGE_HEIGHT_RATIO = 0.38;

export function PlantDetail({
  category,
  description,
  imageUrl,
  name,
}: PlantDetailProps) {
  const { height } = useWindowDimensions();
  const imageHeight = Math.min(height * IMAGE_HEIGHT_RATIO, MAX_IMAGE_HEIGHT);

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={[styles.image, { height: imageHeight }]} />
      <View style={styles.content}>
        <View style={styles.titleStack}>
          <AppText variant="titleXl">{name}</AppText>
          <AppText tone="highlighted">{category}</AppText>
        </View>
        <AppText ellipsizeMode="tail" numberOfLines={3}>{description}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.white,
    width: '100%',
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xxl,
  },
  image: {
    backgroundColor: colors.surface.white,
    width: '100%',
  },
  titleStack: {
    gap: spacing.xxs,
  },
});
