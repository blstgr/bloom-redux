import React from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { radii, sizes, spacing } from '../../../theme';
import { Badge } from '../Badge';
import { BadgePill } from '../BadgePill/BadgePill';

export type PlantCardProps = {
  badge?: { icon?: 'water'; label?: string; variant: 'badge' | 'badgePill' };
  image: ImageSourcePropType;
  onPress?: () => void;
  plantId: string;
};

export function PlantCard({ badge, image, onPress }: PlantCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={image} style={styles.image} />
      {badge ? (
        <View style={styles.badge}>
          {badge.variant === 'badge' ? (
            <Badge icon={badge.icon ?? 'water'} variant="inverted" />
          ) : (
            <BadgePill
              badgeVariant="light"
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
    height: sizes.card.plantHeight,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
