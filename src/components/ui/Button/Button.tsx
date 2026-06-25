import React from 'react';
import {
  Platform,
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
  secondaryBackgroundOpacity?: number;
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
  secondaryBackgroundOpacity = 0.5,
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
  const resolvedIconSize = iconSize ?? (isIconOnly ? sizes.icon.md : size === 'small' ? sizes.icon.sm : sizes.icon.md);
  const keepHugWidth = layout === 'hug' && hasLabel && loading && measuredWidth != null;
  const secondaryTintColor = `rgba(255, 255, 255, ${secondaryBackgroundOpacity})`;

  return (
    <View style={[styles.shadowWrapper, layout === 'fill' && styles.shadowWrapperFill]}>
      <GradientBorder
        borderRadius={radii.pill}
        colors={GLASS_BORDER_COLORS}
        style={styles.buttonSurface}>
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
          {variant === 'secondary' ? (
            Platform.OS === 'android' ? (
              <View style={[styles.blurLayer, { backgroundColor: secondaryTintColor }]} />
            ) : (
              <GlassView
                border={false}
                containerColor="transparent"
                style={styles.blurLayer}
                tintColor={secondaryTintColor}
              />
            )
          ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.white,
    borderRadius: radii.pill,
    position: 'relative',
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
  buttonSurface: {
    zIndex: 1,
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
    zIndex: 1,
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
