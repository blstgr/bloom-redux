import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radii, shadows } from '../../../theme';
import { GradientBorder } from '../GradientBorder';

const GLASS_BLUR_AMOUNT = 4;

export type GlassViewProps = {
  border?: boolean;
  children?: React.ReactNode;
  containerColor?: string;
  fallbackColor?: string;
  radius?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  tintColor?: string;
};

export function GlassView({
  border = true,
  children,
  containerColor = colors.overlay.glass,
  fallbackColor = colors.surface.white,
  radius = radii.pill,
  shadow = true,
  style,
  tintColor = colors.overlay.glass,
}: GlassViewProps) {
  // The blur/tint layers are `position: absolute` and contribute nothing to this View's own
  // content size. A caller with real `children` (Input's row, NavBar's items) already sizes
  // this View correctly via that normal-flow content, same as before this prop existed — only a
  // caller with NO children (GlassButtonSurface, WateringSlider's blurLayer), relying purely on
  // `style` (e.g. StyleSheet.absoluteFill) to size it, needs help: without any real content the
  // View would collapse to zero height. Gate the fill style on that, rather than applying it
  // unconditionally — flexGrow on a real-content case can otherwise balloon several auto-sized
  // ancestors up the tree when a sibling elsewhere happens to be flex:1 (e.g. a screen's
  // scrollable content area), well past this View's own intended size.
  const hasContent = children != null;
  const blurAndTint = (
    <>
      {Platform.OS === 'android' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fallbackColor }]} />
      ) : (
        <BlurView
          blurAmount={GLASS_BLUR_AMOUNT}
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
      <View style={[shadow && shadows.soft, { borderRadius: radius }, style]}>
        <View
          style={[
            styles.borderless,
            !hasContent && styles.fill,
            { backgroundColor: containerColor, borderRadius: radius },
          ]}>
          {blurAndTint}
        </View>
      </View>
    );
  }

  return (
    // Shadow lives on this plain View, not on GradientBorder's LinearGradient: a shadow
    // needs an unclipped plain View to render on — LinearGradient is a third-party native
    // component that doesn't support the boxShadow style, and GradientBorder's own inner
    // View clips to the pill shape, which would also clip a shadow placed on the same layer.
    <View style={[shadow && shadows.soft, { borderRadius: radius }, style]}>
      <GradientBorder
        borderRadius={radius}
        colors={[...gradients.glassBorder]}
        style={[!hasContent && styles.fill, { backgroundColor: containerColor }]}
      >
        {blurAndTint}
      </GradientBorder>
    </View>
  );
}

const styles = StyleSheet.create({
  borderless: {
    overflow: 'hidden',
  },
  fill: {
    flexGrow: 1,
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
});
