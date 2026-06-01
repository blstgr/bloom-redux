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
import { Icon, type IconName } from '../Icon';
import { Loader } from '../Loader';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'normal';
export type ButtonLayout = 'hug' | 'fill';

export type ButtonProps = TouchableOpacityProps & {
  icon?: IconName;
  iconSize?: number;
  label?: string;
  loading?: boolean;
  layout?: ButtonLayout;
  preset?: 'cameraShutter';
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant | 'icon';
};

export function Button({
  disabled,
  icon,
  iconSize,
  layout = 'hug',
  label,
  loading = false,
  size = 'normal',
  preset,
  style,
  variant = 'primary',
  ...pressableProps
}: ButtonProps) {
  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);
  const isDisabled = disabled || loading;
  const resolvedVariant: ButtonVariant = variant === 'icon' ? 'secondary' : variant;
  const foreground = resolvedVariant === 'primary' ? colors.text.inverse : colors.text.primary;
  const hasLabel = Boolean(label);
  const iconOnly = variant === 'icon' || (!hasLabel && Boolean(icon));
  const compact = iconOnly;
  const radius = radii.pill;
  const loaderTone = resolvedVariant === 'primary' ? 'onDark' : 'onLight';
  const loaderSize = 'small';
  // In hug layout, lock the last measured width so swapping label->loader does not shrink the button.
  const keepHugWidth = layout === 'hug' && hasLabel && loading && measuredWidth != null;
  const resolvedIconSize = preset === 'cameraShutter' ? 52 : iconSize ?? (size === 'small' ? 16 : 20);

  return (
    <View style={[styles.shadowWrapper, { borderRadius: radius }, layout === 'fill' && styles.shadowWrapperFill]}>
      <TouchableOpacity
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: isDisabled }}
        disabled={isDisabled}
        style={[
          styles.base,
          styles[size],
          compact && styles.compact,
          styles[resolvedVariant],
          layout === 'fill' && styles.fill,
          iconOnly && styles.iconOnly,
          iconOnly && size === 'small' && styles.iconOnlySmall,
          keepHugWidth && { width: measuredWidth },
          style,
        ]}
        onLayout={event => {
          if (!loading) {
            setMeasuredWidth(event.nativeEvent.layout.width);
          }
        }}
        {...pressableProps}>
        {resolvedVariant === 'secondary' ? <GlassView style={styles.blurLayer} /> : null}
        <View style={[styles.content, isDisabled && styles.contentDisabled]}>
          {loading ? (
            <Loader
              size={loaderSize}
              tone={loaderTone}
            />
          ) : (
            <>
              {icon ? <Icon name={icon} color={foreground} size={resolvedIconSize} /> : null}
              {hasLabel ? (
                <AppText variant="button" tone={resolvedVariant === 'primary' ? 'inverse' : 'primary'}>
                  {label}
                </AppText>
              ) : null}
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  shadowWrapper: {
    ...shadows.soft,
  },
  shadowWrapperFill: {
    width: '100%',
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
    width: sizes.button.normal,
  },
  iconOnlySmall: {
    width: sizes.button.small,
  },
  normal: {
    minHeight: sizes.button.normal,
    minWidth: sizes.button.normal,
  },
  primary: {
    backgroundColor: colors.action.primary,
    borderColor: colors.border.white,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.surface.glassSubtle,
  },
  small: {
    minHeight: sizes.button.small,
    minWidth: sizes.button.small,
    paddingHorizontal: spacing.md,
  },
});
