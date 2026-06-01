import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes } from '../../theme';
import { GlassView } from './GlassView';

export type SegmentedBarBaseProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedBarBase({ children, style }: SegmentedBarBaseProps) {
  return <GlassView style={[styles.base, style]}>{children}</GlassView>;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
    borderColor: colors.border.white,
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
