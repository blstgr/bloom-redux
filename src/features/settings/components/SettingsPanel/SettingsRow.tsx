import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../../../theme';
import { Button } from '../../../../components/ui/Button';
import { AppText } from '../../../../components/ui/AppText';
import { Input } from '../../../../components/ui/Input/Input';

export type SettingsRowVariant =
  | 'text'
  | 'textWithLabel'
  | 'textWithLabelAndButton'
  | 'buttonOnly';

export type SettingsRowProps = {
  buttonLabel?: string;
  editFields?: Array<{
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
  }>;
  editable?: boolean;
  label?: string;
  onPress?: () => void;
  onSave?: (value: string) => void;
  onSaveFields?: (values: string[]) => void;
  secure?: boolean;
  value?: string;
  variant: SettingsRowVariant;
};

export function SettingsRow({
  buttonLabel,
  editFields,
  editable = false,
  label,
  onPress,
  onSave,
  onSaveFields,
  secure = false,
  value = '',
  variant,
}: SettingsRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [fieldDrafts, setFieldDrafts] = React.useState<string[]>(
    (editFields ?? []).map(f => f.value),
  );
  const hasLabel = variant === 'textWithLabel' || variant === 'textWithLabelAndButton';
  const hasButton = variant === 'textWithLabelAndButton' || variant === 'buttonOnly';
  const hasMultiEditFields = Boolean(editFields && editFields.length > 1);

  React.useEffect(() => { setDraft(value); }, [value]);
  React.useEffect(() => {
    setFieldDrafts((editFields ?? []).map(f => f.value));
  }, [editFields]);

  const displayValue = React.useMemo(() => {
    if (!secure || isEditing) return value;
    if ((label ?? '').toLowerCase().includes('api key')) {
      return `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
    }
    return value.replace(/./g, '•');
  }, [isEditing, label, secure, value]);

  const handleSaveOrEdit = () => {
    if (editable) {
      if (isEditing) {
        if (hasMultiEditFields) {
          onSaveFields?.(fieldDrafts);
        } else {
          onSave?.(draft);
        }
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
    onPress?.();
  };

  if (variant === 'buttonOnly') {
    return (
      <View style={styles.row}>
        <Button label={buttonLabel ?? 'Log out'} layout="fill" onPress={onPress} size="small" variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {hasLabel && label && !isEditing ? <AppText variant="titleS">{label}</AppText> : null}
        {isEditing ? (
          hasMultiEditFields && editFields ? (
            <View style={styles.editFields}>
              {editFields.map((field, index) => (
                <Input
                  key={`${field.label}-${index}`}
                  label={field.label}
                  onBlur={() => {}}
                  onChangeText={next =>
                    setFieldDrafts(prev => prev.map((v, i) => (i === index ? next : v)))
                  }
                  placeholder={field.placeholder}
                  type={field.type ?? 'text'}
                  value={fieldDrafts[index] ?? field.value}
                />
              ))}
            </View>
          ) : (
            <Input
              label={label ?? ''}
              onBlur={() => {}}
              onChangeText={setDraft}
              placeholder={secure ? 'New password' : undefined}
              type={secure ? 'password' : 'text'}
              value={draft}
            />
          )
        ) : (
          <AppText>{displayValue}</AppText>
        )}
      </View>
      {hasButton && buttonLabel ? (
        <Button
          label={isEditing ? 'Save' : buttonLabel}
          layout="hug"
          onPress={handleSaveOrEdit}
          size="small"
          style={styles.actionButton}
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignSelf: 'flex-end',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  editFields: {
    gap: spacing.xs,
    width: '100%',
  },
  row: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface.white,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.xxl,
  },
});
