import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radii } from '../../../theme';
import { GlassView } from '../GlassView';

export type SegmentedBarBaseProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedBarBase({ children, style }: SegmentedBarBaseProps) {
  return (
    <GlassView radius={radii.pill} style={[styles.outer, style]}>
      <View style={styles.row}>{children}</View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'center',
  },
  // GradientBorder's inner View doesn't inherit flexDirection from the outer style,
  // so the row layout lives here instead.
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
