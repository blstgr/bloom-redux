import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows } from '../../../theme';
import { GradientBorder } from '../GradientBorder';

export type GlassViewProps = {
  border?: boolean;
  children?: React.ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const GLASS_BORDER_COLORS = ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.7)'];

export function GlassView({ border = true, children, radius = radii.pill, style }: GlassViewProps) {
  const blurAndTint = (
    <>
      <BlurView
        blurAmount={4}
        blurType="light"
        reducedTransparencyFallbackColor={colors.overlay.glass}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tint} />
      {children}
    </>
  );

  if (!border) {
    return (
      <View style={[styles.borderless, style]}>
        {blurAndTint}
      </View>
    );
  }

  return (
    <GradientBorder
      borderRadius={radius}
      colors={GLASS_BORDER_COLORS}
      style={[shadows.soft, style]}
    >
      {blurAndTint}
    </GradientBorder>
  );
}

const styles = StyleSheet.create({
  borderless: {
    backgroundColor: colors.overlay.glass,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay.glass,
  },
});
