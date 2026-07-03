import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radii, shadows } from '../../../theme';
import { GradientBorder } from '../GradientBorder';

export type GlassViewProps = {
  border?: boolean;
  children?: React.ReactNode;
  containerColor?: string;
  fallbackColor?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  tintColor?: string;
};

export function GlassView({
  border = true,
  children,
  containerColor = colors.overlay.glass,
  fallbackColor = colors.surface.white,
  radius = radii.pill,
  style,
  tintColor = colors.overlay.glass,
}: GlassViewProps) {
  const blurAndTint = (
    <>
      {Platform.OS === 'android' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fallbackColor }]} />
      ) : (
        <BlurView
          blurAmount={4}
          blurType="ultraThinMaterialLight"
          reducedTransparencyFallbackColor={fallbackColor}
          style={StyleSheet.absoluteFill}
        />
      )}
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
      colors={[...gradients.glassBorder]}
      style={[shadows.soft, { backgroundColor: containerColor }, style]}
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
