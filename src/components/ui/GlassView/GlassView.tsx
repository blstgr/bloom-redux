import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows } from '../../../theme';
import { GradientBorder } from '../GradientBorder';

export type GlassViewProps = {
  border?: boolean;
  children?: React.ReactNode;
  containerColor?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  tintColor?: string;
};

const GLASS_BORDER_COLORS = ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.7)'];

export function GlassView({
  border = true,
  children,
  containerColor = colors.overlay.glass,
  radius = radii.pill,
  style,
  tintColor = colors.overlay.glass,
}: GlassViewProps) {
  const blurAndTint = (
    <>
      <BlurView
        blurAmount={4}
        blurType="light"
        reducedTransparencyFallbackColor={tintColor}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tint, { backgroundColor: tintColor }]} />
      {children}
    </>
  );

  if (!border) {
    return (
      <View style={[styles.borderless, { backgroundColor: containerColor }, style]}>
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
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
});
