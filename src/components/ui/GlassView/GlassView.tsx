import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows, sizes } from '../../../theme';

export type GlassViewProps = {
  children?: React.ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlassView({ children, radius = radii.pill, style }: GlassViewProps) {
  return (
    <View style={[styles.container, { borderRadius: radius }, style]}>
      <BlurView
        blurAmount={4}
        blurType="light"
        reducedTransparencyFallbackColor={colors.surface.glassLight}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tint} />
      <View style={styles.highlight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.overlay.glass20,
    borderColor: colors.border.white,
    borderWidth: sizes.border.thin,
    overflow: 'hidden',
    ...shadows.soft,
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay.glass20,
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderColor: colors.border.glassSoft,
    borderWidth: sizes.border.thin,
  },
});
