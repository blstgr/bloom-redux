import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from '../../../theme';

export type AppTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyHighlight'
  | 'small'
  | 'hero'
  | 'headline'
  | 'title'
  | 'sectionTitle'
  | 'body'
  | 'button'
  | 'caption';

export type AppTextTone = 'primary' | 'secondary' | 'muted' | 'inverse' | 'dark';

export type AppTextProps = TextProps & {
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
  tone?: AppTextTone;
  variant?: AppTextVariant;
};

export function AppText({
  align = 'left',
  children,
  style,
  tone = 'primary',
  variant = 'body',
  ...textProps
}: AppTextProps) {
  const resolvedVariant = variantMap[variant];

  return (
    <Text
      style={[
        styles.base,
        typography[resolvedVariant],
        { color: colors.text[tone], textAlign: align },
        variant === 'bodyHighlight' && styles.bodyHighlight,
        style,
      ]}
      {...textProps}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
  },
  bodyHighlight: {
    fontFamily: typography.sectionTitle.fontFamily,
  },
});

const variantMap: Record<AppTextVariant, keyof typeof typography> = {
  h1: 'hero',
  h2: 'headline',
  h3: 'title',
  body: 'body',
  bodyHighlight: 'body',
  small: 'small',
  hero: 'hero',
  headline: 'headline',
  title: 'title',
  sectionTitle: 'sectionTitle',
  button: 'button',
  caption: 'caption',
};
