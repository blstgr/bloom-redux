import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, layout, spacing } from '../../../../theme';
import { AppText } from '../../../../components/ui/AppText';

export type PlantDetailProps = {
  category: string;
  description: string;
  imageUrl: string;
  name: string;
};

export function PlantDetail({
  category,
  description,
  imageUrl,
  name,
}: PlantDetailProps) {
  const { height } = useWindowDimensions();
  const imageHeight = Math.min(height * 0.38, 326);

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={[styles.image, { height: imageHeight }]} />
      <View style={styles.content}>
        <View style={styles.titleStack}>
          <AppText variant="hero">{name}</AppText>
          <AppText tone="secondary">{category}</AppText>
        </View>
        <AppText>{description.slice(0, 180)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.warm,
    width: '100%',
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xxl,
  },
  image: {
    backgroundColor: colors.surface.plantPlaceholder,
    width: '100%',
  },
  titleStack: {
    gap: spacing.xxs,
  },
});
