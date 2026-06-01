import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, shadows, sizes, spacing } from '../../../../theme';
import { Button } from '../../../../components/ui/Button';
import { SettingsRow, type SettingsRowProps } from './SettingsRow';

export type SettingsPanelProps = {
  rows: SettingsRowProps[];
  onLogoutPress?: () => void;
};

export function SettingsPanel({ onLogoutPress, rows }: SettingsPanelProps) {
  return (
    <View style={styles.panel}>
      {rows.map(row => (
        <SettingsRow key={`${row.variant}-${row.label ?? row.value ?? 'row'}`} {...row} />
      ))}
      {onLogoutPress ? (
        <View style={styles.logout}>
          <Button label="Log out" onPress={onLogoutPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logout: {
    backgroundColor: colors.surface.white,
    padding: spacing.xxl,
  },
  panel: {
    ...shadows.soft,
    backgroundColor: 'transparent',
    borderColor: colors.border.glass,
    borderRadius: radii.xxl,
    borderWidth: sizes.border.thin,
    gap: spacing.xxs,
    overflow: 'hidden',
    width: '100%',
  },
});
