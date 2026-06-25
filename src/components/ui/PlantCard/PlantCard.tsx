import React from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { radii, spacing } from '../../../theme';
import { Badge } from '../Badge';
import { BadgePill } from '../BadgePill/BadgePill';

const PLANT_CARD_HEIGHT = 130;

export type PlantCardBadge = {
  icon?: 'water';
  label?: string;
  type: 'badge' | 'pill';
};

export type PlantCardProps = {
  badge?: PlantCardBadge;
  image: ImageSourcePropType;
  onPress?: () => void;
};

export function PlantCard({ badge, image, onPress }: PlantCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={image} style={styles.image} />
      {badge ? (
        <View style={styles.badge}>
          {badge.type === 'badge' ? (
            <Badge icon={badge.icon ?? 'water'} variant="inverted" />
          ) : (
            <BadgePill
              icon={badge.icon ?? 'water'}
              label={badge.label ?? '15 May'}
              variant="inverted"
            />
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  card: {
    borderRadius: radii.xxl,
    height: PLANT_CARD_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
