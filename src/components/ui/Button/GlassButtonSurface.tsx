import React from 'react';
import { StyleSheet, View, type LayoutRectangle, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';

import { gradients, radii, shadows } from '../../../theme';
import { GlassView } from '../GlassView';

import { GLASS_BUTTON_BORDER_INSET, GLASS_BUTTON_BORDER_WIDTH } from './glassButtonTokens';

const GLASS_BUTTON_BORDER_STOPS = gradients.glassBorder.map(parseRgbaStop);

type GlassButtonSurfaceProps = {
  children: React.ReactNode;
  glassColor: string;
  onLayout?: (layout: LayoutRectangle) => void;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlassButtonSurface({
  children,
  glassColor,
  onLayout,
  radius = radii.pill,
  style,
}: GlassButtonSurfaceProps) {
  const [layout, setLayout] = React.useState<LayoutRectangle | null>(null);

  return (
    <View
      style={[styles.surface, { borderRadius: radius }, style]}
      onLayout={event => {
        setLayout(event.nativeEvent.layout);
        onLayout?.(event.nativeEvent.layout);
      }}>
      <GlassView
        border={false}
        containerColor="transparent"
        fallbackColor={glassColor}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        tintColor={glassColor}
      />
      {children}
      {layout ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg height={layout.height} width={layout.width}>
            <Defs>
              <SvgGradient id="glassButtonBorder" x1="0" x2="1" y1="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={GLASS_BUTTON_BORDER_STOPS[0].color}
                  stopOpacity={GLASS_BUTTON_BORDER_STOPS[0].opacity}
                />
                <Stop
                  offset="1"
                  stopColor={GLASS_BUTTON_BORDER_STOPS[1].color}
                  stopOpacity={GLASS_BUTTON_BORDER_STOPS[1].opacity}
                />
              </SvgGradient>
            </Defs>
            <Rect
              fill="none"
              height={layout.height - GLASS_BUTTON_BORDER_WIDTH}
              rx={radius}
              stroke="url(#glassButtonBorder)"
              strokeWidth={GLASS_BUTTON_BORDER_WIDTH}
              width={layout.width - GLASS_BUTTON_BORDER_WIDTH}
              x={GLASS_BUTTON_BORDER_INSET}
              y={GLASS_BUTTON_BORDER_INSET}
            />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

function parseRgbaStop(value: string) {
  const match = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([01](?:\.\d+)?)\)$/);
  if (!match) return { color: value, opacity: 1 };

  const [, red, green, blue, opacity] = match;
  return {
    color: `rgb(${red}, ${green}, ${blue})`,
    opacity: Number(opacity),
  };
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: 'transparent',
    overflow: 'visible',
    position: 'relative',
    ...shadows.soft,
  },
});
