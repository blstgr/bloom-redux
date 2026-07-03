import React from 'react';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '../../../theme';

export type BottomActionsProps = {
  bottomBar?: ReactNode;
  primaryButton?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BottomActions({ bottomBar, primaryButton, style }: BottomActionsProps) {
  return (
    <View style={[styles.container, style]}>
      {primaryButton ? <View style={styles.buttonWrap}>{primaryButton}</View> : null}
      {bottomBar ? <View style={styles.barWrap}>{bottomBar}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonWrap: {
    width: '100%',
  },
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    width: '100%',
  },
});
