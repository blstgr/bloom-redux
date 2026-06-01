import React from 'react';
import { StyleSheet, View, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../AppText';
import { sizes, spacing } from '../../../theme';

export type TopActionsProps = {
  mode?: 'centered' | 'hero';
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
};

export function TopActions({ leftAction, mode = 'centered', rightAction, style, title }: TopActionsProps) {
  if (mode === 'hero') {
    return (
      <View style={[styles.heroContainer, style]}>
        <View style={styles.heroTitleWrap}>
          {typeof title === 'string' ? <AppText variant="hero">{title}</AppText> : title}
        </View>
        <View style={styles.side}>{rightAction}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{leftAction}</View>
      <View style={styles.titleWrap}>
        {typeof title === 'string' ? <AppText variant="sectionTitle">{title}</AppText> : title}
      </View>
      <View style={styles.side}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: sizes.button.normal,
    width: '100%',
  },
  heroContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.button.normal,
    width: '100%',
  },
  heroTitleWrap: {
    flex: 1,
  },
  side: {
    alignItems: 'center',
    height: sizes.button.normal,
    justifyContent: 'center',
    width: sizes.button.normal,
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: sizes.button.normal + spacing.sm,
    maxWidth: '100%',
    position: 'absolute',
    right: sizes.button.normal + spacing.sm,
  },
});
