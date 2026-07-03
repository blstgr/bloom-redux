import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from '../../../theme';

export type AppTextVariant =
  // Titles — display font, 4 sizes
  | 'titleXl'
  | 'titleL'
  | 'titleM'
  | 'titleS'
  // Body — 2 variations
  | 'body'
  | 'bodyS'
  // Utility
  | 'button';

export type AppTextTone = 'primary' | 'inverse' | 'placeholder' | 'highlighted';

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
  tone,
  variant = 'body',
  ...textProps
}: AppTextProps) {
  const resolvedTone = tone ?? 'primary';
  const color = colors.text[resolvedTone];

  return (
    <Text
      style={[
        typography[variant],
        { color, textAlign: align },
        style,
      ]}
      {...textProps}>
      {children}
    </Text>
  );
}
