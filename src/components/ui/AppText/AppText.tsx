import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from '../../../theme';

export type AppTextVariant =
  // Titles — display font, 4 sizes
  | 'titleXl'
  | 'titleL'
  | 'titleM'
  | 'titleS'
  // Body — 3 variations
  | 'body'
  | 'bodyHighlighted'
  | 'bodyS'
  // Utility
  | 'button';

export type AppTextTone = 'primary' | 'inverse' | 'placeholder';

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
  const typographyStyle = typography[variant];
  const color = typographyStyle.color ?? colors.text[tone];

  return (
    <Text
      style={[
        typographyStyle,
        { color, textAlign: align },
        style,
      ]}
      {...textProps}>
      {children}
    </Text>
  );
}
