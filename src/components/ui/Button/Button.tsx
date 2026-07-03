import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, gradients, radii, shadows, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { GradientBorder } from '../GradientBorder';
import { Icon, type IconName } from '../Icon';
import { Loader } from '../Loader';

import { GlassButtonSurface } from './GlassButtonSurface';
import { GLASS_BUTTON_ACTIVE_OPACITY } from './glassButtonTokens';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'normal';
export type ButtonLayout = 'hug' | 'fill';

type ButtonBaseProps = TouchableOpacityProps & {
  iconSize?: number;
  loading?: boolean;
  layout?: ButtonLayout;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

type ButtonIconOnlyProps = ButtonBaseProps & {
  accessibilityLabel: string;
  icon: IconName;
  iconOnly?: true;
  label?: never;
};

type ButtonTextProps = ButtonBaseProps & {
  accessibilityLabel?: string;
  icon?: IconName;
  iconOnly?: false;
  label: string;
};

export type ButtonProps = ButtonIconOnlyProps | ButtonTextProps;

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
  const [buttonLayout, setButtonLayout] = React.useState<{ width: number; height: number } | null>(null);
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const foreground = isPrimary ? colors.text.inverse : colors.text.primary;
  const hasLabel = Boolean(label);
  const isIconOnly = iconOnly || (!hasLabel && Boolean(icon));
  const loaderTone = isPrimary ? 'onDark' : 'onLight';
  const resolvedIconSize = iconSize ?? (isIconOnly ? sizes.icon.md : size === 'small' ? sizes.icon.sm : sizes.icon.md);
  const keepHugWidth = layout === 'hug' && hasLabel && loading && buttonLayout != null;

  const touchableStyle = [
    styles.base,
    styles[size],
    isIconOnly && styles.compact,
    layout === 'fill' && styles.fill,
    isIconOnly && styles.iconOnly,
    isIconOnly && size === 'small' && styles.iconOnlySmall,
    keepHugWidth && { width: buttonLayout.width },
  ];

  const content = (
    <View style={[styles.content, isDisabled && styles.contentDisabled]}>
      {loading ? (
        <Loader size="small" tone={loaderTone} />
      ) : (
        <>
          {icon ? <Icon name={icon} color={foreground} size={resolvedIconSize} /> : null}
          {hasLabel ? (
            <AppText variant="button" tone={isPrimary ? 'inverse' : 'primary'}>
              {label}
            </AppText>
          ) : null}
        </>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <View style={[styles.shadowWrapper, layout === 'fill' && styles.shadowWrapperFill, style]}>
        <GradientBorder
          borderRadius={radii.pill}
          colors={[...gradients.glassBorder]}
          style={styles.buttonSurface}>
          <TouchableOpacity
            activeOpacity={GLASS_BUTTON_ACTIVE_OPACITY}
            accessibilityRole="button"
            accessibilityState={{ busy: loading, disabled: isDisabled }}
            disabled={isDisabled}
            style={[...touchableStyle, styles.primary]}
            onLayout={event => setButtonLayout(event.nativeEvent.layout)}
            {...pressableProps}>
            {content}
          </TouchableOpacity>
        </GradientBorder>
      </View>
    );
  }

  return (
    <GlassButtonSurface
      glassColor={colors.surface.glass}
      onLayout={setButtonLayout}
      style={[styles.shadowWrapper, layout === 'fill' && styles.shadowWrapperFill, style]}>
      <TouchableOpacity
        activeOpacity={GLASS_BUTTON_ACTIVE_OPACITY}
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: isDisabled }}
        disabled={isDisabled}
        style={[...touchableStyle, styles.glass]}
        {...pressableProps}>
        {content}
      </TouchableOpacity>
    </GlassButtonSurface>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.white,
    borderRadius: radii.pill,
    overflow: 'hidden',
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
  glass: {
    backgroundColor: 'transparent',
    overflow: 'visible',
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
  small: {
    minHeight: sizes.button.small,
    minWidth: sizes.button.small,
    paddingHorizontal: spacing.md,
  },
});
