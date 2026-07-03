import React from 'react';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { layout, spacing } from '../../../theme';

export type BottomActionsProps = {
  bottomBar?: ReactNode;
  primaryButton?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BottomActions({ bottomBar, primaryButton, style }: BottomActionsProps) {
  return (
    <View style={[styles.container, style]}>
      {primaryButton ? <View style={styles.buttonWrap}>{centeredChild(primaryButton)}</View> : null}
      {bottomBar ? <View style={styles.barWrap}>{centeredChild(bottomBar)}</View> : null}
    </View>
  );
}

function centeredChild(node: ReactNode) {
  if (!React.isValidElement<{ style?: StyleProp<ViewStyle> }>(node)) return node;

  const existingStyle = node.props.style;
  return React.cloneElement(node, {
    style: [existingStyle, styles.centeredChild],
  });
}

const styles = StyleSheet.create({
  barWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonWrap: {
    alignItems: 'center',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    width: '100%',
  },
  centeredChild: {
    alignSelf: 'center',
  },
});
