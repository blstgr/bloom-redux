import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, shadows, sizes, spacing, typography } from '../../../theme';
import { AppText } from '../AppText';
import { Icon, type IconName } from '../Icon';

export type InputType = 'text' | 'email' | 'password' | 'number';

export type InputProps = {
  disabled?: boolean;
  error?: string;
  labelIcon?: IconName;
  label: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  placeholder?: string;
  type: InputType;
  value: string;
};

export function Input({
  disabled = false,
  error,
  labelIcon,
  label,
  onBlur,
  onChangeText,
  placeholder,
  type,
  value,
}: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {labelIcon ? <Icon name={labelIcon} /> : null}
        <AppText variant="titleS">{label}</AppText>
      </View>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          accessibilityLabel={label}
          editable={!disabled}
          keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          secureTextEntry={type === 'password'}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            disabled && styles.inputDisabled,
            Boolean(error) && styles.inputError,
          ]}
          value={value}
        />
      </View>
      {error ? (
        <AppText variant="body" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    width: '100%',
  },
  errorText: {
    color: colors.brand.orange,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  inputWrapper: {
    borderRadius: radii.pill,
  },
  inputWrapperFocused: {
    ...shadows.soft,
  },
  input: {
    borderColor: colors.text.placeholder,
    borderRadius: radii.pill,
    borderWidth: sizes.border.thin,
    color: colors.text.primary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    height: sizes.input.height,
    paddingHorizontal: spacing.md,
  },
  inputDisabled: {
    color: colors.action.disabled,
  },
  inputError: {
    borderColor: colors.brand.orange,
  },
  inputFocused: {
    backgroundColor: colors.surface.white,
    borderColor: colors.text.placeholder,
  },
});
