import React from 'react';
import { Animated, Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { colors, radii, sizes, spacing } from '../../../../theme';
import { BadgePill } from '../../../../components/ui/BadgePill/BadgePill';
import { Icon } from '../../../../components/ui/Icon';

export type WateringCardProps = {
  day: string;
  imageUrl: string;
  month: string;
  onDismiss?: () => void;
  onPress?: () => void;
};

export function WateringCard({
  day,
  imageUrl,
  month,
  onDismiss,
  onPress,
}: WateringCardProps) {
  const cardHeight = sizes.watering.cardHeight;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - spacing.md * 2, sizes.watering.cardMaxWidth);
  const [dismissed, setDismissed] = React.useState(false);
  const collapse = React.useRef(new Animated.Value(1)).current;
  const revealWidth = cardWidth;

  const handleDismiss = React.useCallback(() => {
    if (dismissed) return;
    setDismissed(true);
    Animated.timing(collapse, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onDismiss?.();
    });
  }, [collapse, dismissed, onDismiss]);

  if (dismissed) {
    return (
      <Animated.View
        style={{
          height: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, cardHeight] }),
          opacity: collapse,
          overflow: 'hidden',
        }}
      />
    );
  }

  return (
    <Swipeable
      containerStyle={{ borderRadius: radii.photo, overflow: 'hidden', width: cardWidth }}
      friction={1.8}
      overshootRight={false}
      rightThreshold={96}
      renderRightActions={(_, translation) => (
        <RightActionReveal revealWidth={revealWidth} translation={translation} />
      )}
      onSwipeableOpen={handleDismiss}>
      <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, { width: cardWidth }]}>
        <Image source={{ uri: imageUrl }} style={[styles.image, { width: cardWidth }]} />
        <View pointerEvents="none" style={styles.badge}>
          <BadgePill badgeVariant="light" icon="water" label={`${day} ${month}`} variant="inverted" />
        </View>
      </Pressable>
    </Swipeable>
  );
}

function RightActionReveal({
  revealWidth,
  translation,
}: {
  revealWidth: number;
  translation: { value: number };
}) {
  const dropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.min(Math.max(-translation.value, 0), revealWidth) / revealWidth,
      [0, 0.65, 0.8],
      [1, 1, 0],
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.min(Math.max(-translation.value, 0), revealWidth) / revealWidth,
      [0.65, 0.8, 1],
      [0, 0.2, 1],
    ),
  }));

  return (
    <View style={[styles.reveal, { width: revealWidth }]}>
      <Reanimated.View style={[styles.iconOverlay, dropStyle]}>
        <Icon color={colors.icon.inverse} name="water" />
      </Reanimated.View>
      <Reanimated.View style={[styles.iconOverlay, checkStyle]}>
        <Icon color={colors.icon.inverse} name="check" />
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  card: {
    backgroundColor: colors.brand.green,
    borderRadius: radii.photo,
    height: sizes.watering.cardHeight,
    overflow: 'hidden',
  },
  iconOverlay: {
    position: 'absolute',
    right: spacing.xl,
  },
  image: {
    backgroundColor: colors.surface.plantPlaceholder,
    borderRadius: radii.photo,
    height: sizes.watering.cardHeight,
    position: 'absolute',
  },
  reveal: {
    alignItems: 'flex-end',
    backgroundColor: colors.brand.green,
    bottom: spacing.none,
    height: sizes.watering.cardHeight,
    justifyContent: 'center',
    paddingRight: spacing.xl,
  },
});
