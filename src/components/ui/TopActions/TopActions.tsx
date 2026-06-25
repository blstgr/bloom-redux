import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';

import { AppText } from '../AppText';
import { sizes, spacing } from '../../../theme';
import { Button } from '../Button';
import type { IconName } from '../Icon';

export type TopActionsProps = {
  mode?: 'centered' | 'hero';
  leftAction?: ReactNode;
  leftIcon?: IconName;
  onClose?: () => void;
  onLeftPress?: () => void;
  onMore?: () => void;
  onRightPress?: () => void;
  rightAction?: ReactNode;
  rightIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
};

const TOP_ACTION_BACKGROUND_OPACITY = 0.2;

function renderAction(action: ReactNode, icon: IconName | undefined, onPress: (() => void) | undefined) {
  if (action) return action;
  if (!icon) return null;

  return (
    <Button
      icon={icon}
      iconOnly
      onPress={onPress}
      secondaryBackgroundOpacity={TOP_ACTION_BACKGROUND_OPACITY}
      size="small"
      variant="secondary"
    />
  );
}

export function TopActions({
  leftAction,
  leftIcon,
  mode = 'centered',
  onClose,
  onLeftPress,
  onMore,
  onRightPress,
  rightAction,
  rightIcon,
  style,
  title,
}: TopActionsProps) {
  const resolvedLeftAction = renderAction(leftAction, leftIcon ?? (onClose ? 'close' : undefined), onLeftPress ?? onClose);
  const resolvedRightAction = renderAction(rightAction, rightIcon ?? (onMore ? 'more' : undefined), onRightPress ?? onMore);

  if (mode === 'hero') {
    return (
      <View style={[styles.heroContainer, style]}>
        <View style={styles.heroTitleWrap}>
          {typeof title === 'string' ? <AppText variant="titleXl">{title}</AppText> : title}
        </View>
        <View style={styles.side}>{resolvedRightAction}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{resolvedLeftAction}</View>
      <View style={styles.titleWrap}>
        {typeof title === 'string' ? <AppText variant="titleS">{title}</AppText> : title}
      </View>
      <View style={styles.side}>{resolvedRightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: sizes.button.default,
    width: '100%',
  },
  heroContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.button.default,
    width: '100%',
  },
  heroTitleWrap: {
    flex: 1,
  },
  side: {
    alignItems: 'center',
    height: sizes.button.default,
    justifyContent: 'center',
    width: sizes.button.default,
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: sizes.button.default + spacing.sm,
    maxWidth: '100%',
    position: 'absolute',
    right: sizes.button.default + spacing.sm,
  },
});
