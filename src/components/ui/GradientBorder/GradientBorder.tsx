import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export type GradientBorderProps = {
  borderRadius: number;
  children: React.ReactNode;
  colors: string[];
  end?: { x: number; y: number };
  start?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  thickness?: number;
};

/**
 * Renders a gradient border by using a LinearGradient as the outer shell
 * with `padding = thickness`, and an inner View that clips content.
 *
 * To revert to a solid border: remove this wrapper in the parent component
 * and restore `borderColor` + `borderWidth` on the container style.
 */
export function GradientBorder({
  borderRadius,
  children,
  colors: gradientColors,
  end = { x: 1, y: 1 },
  start = { x: 0, y: 0 },
  style,
  thickness = 1,
}: GradientBorderProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      end={end}
      start={start}
      style={[{ borderRadius, padding: thickness }, style]}
    >
      <View style={[styles.inner, { borderRadius: borderRadius - thickness }]}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
  },
});
