import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radii, spacing } from '../../../theme';
import { Badge } from '../Badge';
import { BadgePill } from '../BadgePill';

const PLANT_CARD_HEIGHT = 130;

export type PlantCardBadge =
  | {
    icon?: 'water';
    label?: never;
    type: 'badge';
  }
  | {
    icon?: 'water';
    label: string;
    type: 'pill';
  };

export type PlantCardProps = {
  accessibilityLabel: string;
  badge?: PlantCardBadge;
  image: ImageSourcePropType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PlantCard({
  accessibilityLabel,
  badge,
  image,
  onPress,
  style,
}: PlantCardProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, style]}>
      <Image resizeMode="cover" source={image} style={styles.image} />
      {badge ? (
        <View style={styles.badge}>
          {badge.type === 'badge' ? (
            <Badge icon={badge.icon ?? 'water'} variant="inverted" />
          ) : (
            <BadgePill
              icon={badge.icon ?? 'water'}
              label={badge.label}
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
