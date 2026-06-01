import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '../../../theme';
import { Icon } from '../Icon';

const EDITABLE_TITLE_LINE_HEIGHT = typography.title.lineHeight;
const SINGLE_LINE_HEIGHT = EDITABLE_TITLE_LINE_HEIGHT;
// iOS reports TextInput contentSize via native font metrics, ignoring styled lineHeight.
// This buffer compensates for the discrepancy so the last line is never clipped.
const IOS_LINE_HEIGHT_BUFFER = spacing.xs;

export type EditableTitleProps = {
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function EditableTitle({
  maxLength,
  onChange,
  placeholder = 'Enter plant name',
  value,
}: EditableTitleProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [inputHeight, setInputHeight] = React.useState(SINGLE_LINE_HEIGHT);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleBlur = React.useCallback(() => {
    // Empty value is not a valid saved state; keep editing active.
    if (draft.trim().length === 0) {
      setEditing(true);
      return;
    }
    setEditing(false);
  }, [draft]);

  return (
    <View style={styles.root}>
      {editing ? (
        <View style={styles.editWrap}>
          {/*
           * iOS: onContentSizeChange reports heights via native font metrics, ignoring the
           * styled lineHeight, so it clips multi-line content. Text layout is always accurate,
           * so we mirror the input text invisibly and read its onLayout height instead.
           */}
          <Text
            style={[styles.input, styles.mirror]}
            onLayout={e => setInputHeight(e.nativeEvent.layout.height + IOS_LINE_HEIGHT_BUFFER)}
          >
            {draft || placeholder}
          </Text>
          <TextInput
            autoFocus
            maxLength={maxLength}
            multiline
            onBlur={handleBlur}
            onChangeText={next => {
              setDraft(next);
              onChange(next);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.text.placeholder}
            scrollEnabled={false}
            style={[styles.input, { height: inputHeight }]}
            textAlignVertical="top"
            value={draft}
          />
        </View>
      ) : (
        <Pressable onPress={() => setEditing(true)} style={styles.displayRow}>
          <Text style={styles.displayText}>{value.length > 0 ? value : ''}</Text>
          <Icon color={colors.icon.primary} name="edit" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    width: '100%',
  },
  editWrap: {
    alignSelf: 'center',
    maxWidth: '100%',
    width: '100%',
  },
  displayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  displayText: {
    color: colors.text.primary,
    flexShrink: 1,
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    letterSpacing: 0,
    lineHeight: EDITABLE_TITLE_LINE_HEIGHT,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    backgroundColor: colors.surface.white,
    color: colors.text.primary,
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    letterSpacing: 0,
    lineHeight: EDITABLE_TITLE_LINE_HEIGHT,
    maxWidth: '100%',
    minHeight: SINGLE_LINE_HEIGHT,
    paddingHorizontal: spacing.none,
    paddingVertical: spacing.none,
    textAlign: 'center',
    textAlignVertical: 'top',
  },
  mirror: {
    opacity: 0,
    position: 'absolute',
  },
});
