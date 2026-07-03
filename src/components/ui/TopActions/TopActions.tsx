import React from 'react';
import { type ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { GlassButtonSurface, GLASS_BUTTON_ACTIVE_OPACITY } from '../Button';
import { Icon, type IconName } from '../Icon';

export type TopActionsProps = {
  mode?: 'centered' | 'hero';
  leftAction?: ReactNode;
  leftIcon?: IconName;
  leftLabel?: string;
  onClose?: () => void;
  onLeftPress?: () => void;
  onMore?: () => void;
  onRightPress?: () => void;
  rightAction?: ReactNode;
  rightIcon?: IconName;
  rightLabel?: string;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
};

const TOP_ACTION_GLASS_COLOR = colors.overlay.glass;
const TOP_ACTION_RADIUS_RATIO = 0.5;

function TopActionButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <GlassButtonSurface
      glassColor={TOP_ACTION_GLASS_COLOR}
      radius={sizes.button.small * TOP_ACTION_RADIUS_RATIO}
      style={styles.topActionButtonWrap}>
      <TouchableOpacity
        accessibilityLabel={label}
        accessibilityRole="button"
        activeOpacity={GLASS_BUTTON_ACTIVE_OPACITY}
        onPress={onPress}
        style={styles.topActionButton}>
        <Icon color={colors.icon.primary} name={icon} size={sizes.icon.md} />
      </TouchableOpacity>
    </GlassButtonSurface>
  );
}

function renderAction(
  action: ReactNode,
  icon: IconName | undefined,
  label: string | undefined,
  onPress: (() => void) | undefined,
) {
  if (action) return action;
  if (!icon) return null;

  return <TopActionButton icon={icon} label={label ?? icon} onPress={onPress} />;
}

export function TopActions({
  leftAction,
  leftIcon,
  leftLabel,
  mode = 'centered',
  onClose,
  onLeftPress,
  onMore,
  onRightPress,
  rightAction,
  rightIcon,
  rightLabel,
  style,
  title,
}: TopActionsProps) {
  const resolvedLeftAction = renderAction(
    leftAction,
    leftIcon ?? (onClose ? 'close' : undefined),
    leftLabel ?? (onClose ? 'Close' : undefined),
    onLeftPress ?? onClose,
  );
  const resolvedRightAction = renderAction(
    rightAction,
    rightIcon ?? (onMore ? 'more' : undefined),
    rightLabel ?? (onMore ? 'More options' : undefined),
    onRightPress ?? onMore,
  );

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
  topActionButtonWrap: {
    height: sizes.button.small,
    width: sizes.button.small,
  },
  topActionButton: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: sizes.button.small,
    justifyContent: 'center',
    overflow: 'visible',
    width: sizes.button.small,
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
