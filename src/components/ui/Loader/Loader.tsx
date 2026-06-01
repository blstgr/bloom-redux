import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';

export type LoaderProps = {
  overlay?: boolean;
  size?: 'default' | 'small';
  tone?: 'onLight' | 'onDark';
};

export function Loader({ overlay = false, size = 'default', tone = 'onDark' }: LoaderProps) {
  const color = tone === 'onLight' ? colors.icon.primary : colors.icon.inverse;
  const boxSize = size === 'small' ? spacing.xxl : sizes.button.normal;
  const spinnerSize = size === 'small' ? 'small' : 'large';

  return (
    <View
      style={[
        styles.container,
        { height: boxSize, width: boxSize },
        overlay && (tone === 'onLight' ? styles.overlayLight : styles.overlayDark),
      ]}>
      <ActivityIndicator color={color} size={spinnerSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayDark: {
    backgroundColor: colors.overlay.dark18,
    borderRadius: radii.pill,
  },
  overlayLight: {
    backgroundColor: colors.overlay.light45,
    borderRadius: radii.pill,
  },
});
