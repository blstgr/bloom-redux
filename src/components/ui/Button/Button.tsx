import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { GlassView } from '../GlassView';
import { GradientBorder } from '../GradientBorder';
import { Icon, type IconName } from '../Icon';
import { Loader } from '../Loader';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'normal';
export type ButtonLayout = 'hug' | 'fill';

export type ButtonProps = TouchableOpacityProps & {
  icon?: IconName;
  iconOnly?: boolean;
  iconSize?: number;
  label?: string;
  loading?: boolean;
  layout?: ButtonLayout;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

const GLASS_BORDER_COLORS = ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.7)'];

export function Button({
  disabled,
  icon,
  iconOnly = false,
  iconSize,
  layout = 'hug',
  label,
  loading = false,
  size = 'normal',
  style,
  variant = 'primary',
  ...pressableProps
}: ButtonProps) {
  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);
  const isDisabled = disabled || loading;
  const foreground = variant === 'primary' ? colors.text.inverse : colors.text.primary;
  const hasLabel = Boolean(label);
  const isIconOnly = iconOnly || (!hasLabel && Boolean(icon));
  const loaderTone = variant === 'primary' ? 'onDark' : 'onLight';
  const resolvedIconSize = iconSize ?? (size === 'small' ? sizes.icon.sm : sizes.icon.md);
  const keepHugWidth = layout === 'hug' && hasLabel && loading && measuredWidth != null;

  return (
    <GradientBorder
      borderRadius={radii.pill}
      colors={GLASS_BORDER_COLORS}
      style={[styles.shadowWrapper, layout === 'fill' && styles.shadowWrapperFill]}>
      <TouchableOpacity
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: isDisabled }}
        disabled={isDisabled}
        style={[
          styles.base,
          styles[size],
          isIconOnly && styles.compact,
          styles[variant],
          layout === 'fill' && styles.fill,
          isIconOnly && styles.iconOnly,
          isIconOnly && size === 'small' && styles.iconOnlySmall,
          keepHugWidth && { width: measuredWidth },
          style,
        ]}
        onLayout={event => {
          setMeasuredWidth(event.nativeEvent.layout.width);
        }}
        {...pressableProps}>
        {variant === 'secondary' ? <GlassView border={false} style={styles.blurLayer} /> : null}
        <View style={[styles.content, isDisabled && styles.contentDisabled]}>
          {loading ? (
            <Loader size="small" tone={loaderTone} />
          ) : (
            <>
              {icon ? <Icon name={icon} color={foreground} size={resolvedIconSize} /> : null}
              {hasLabel ? (
                <AppText variant="button" tone={variant === 'primary' ? 'inverse' : 'primary'}>
                  {label}
                </AppText>
              ) : null}
            </>
          )}
        </View>
      </TouchableOpacity>
    </GradientBorder>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    alignSelf: 'flex-start',
    ...shadows.soft,
  },
  shadowWrapperFill: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  blurLayer: {
    ...StyleSheet.absoluteFill,
  },
  contentDisabled: {
    opacity: 0.48,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  compact: {
    paddingHorizontal: spacing.none,
  },
  fill: {
    width: '100%',
  },
  iconOnly: {
    aspectRatio: 1,
    borderRadius: radii.pill,
    height: sizes.button.default,
    width: sizes.button.default,
  },
  iconOnlySmall: {
    height: sizes.button.small,
    width: sizes.button.small,
  },
  normal: {
    minHeight: sizes.button.default,
    minWidth: sizes.button.default,
  },
  primary: {
    backgroundColor: colors.action.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  small: {
    minHeight: sizes.button.small,
    minWidth: sizes.button.small,
    paddingHorizontal: spacing.md,
  },
});
