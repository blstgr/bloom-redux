import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { SettingsPanel } from '../features/settings/components/SettingsPanel';
import { colors, spacing } from '../theme';

import { SCREENS } from './constants';
import { TabNavigator } from './TabNavigator';
import type { SettingsDrawerParamList } from './types';

const Drawer = createDrawerNavigator<SettingsDrawerParamList>();

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const handleLogout = () => {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: SCREENS.AUTH_START }],
      }),
    );
  };

  return (
    // The drawer has no separate Settings route: the assignment requires Drawer navigation,
    // while the design uses a full-screen settings panel opened from the top-right more button.
    // Keeping settings as custom drawer content preserves that visual model and still enables
    // the drawer gesture through React Navigation.
    <ScreenLayout
      horizontalPadding
      contentStyle={styles.drawerContent}
      topActions={(
        <TopActions
          onRightPress={() => navigation.closeDrawer()}
          rightIcon="close"
          rightLabel="Close settings"
        />
      )}>
      <SettingsPanel
        rows={[
          { label: 'Email', value: 'plantkiller@gmail.com', variant: 'textWithLabel' },
          { buttonLabel: 'Log out', onPress: handleLogout, variant: 'buttonOnly' },
        ]}
      />
    </ScreenLayout>
  );
}

export function SettingsDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerPosition: 'right',
        drawerStyle: styles.drawer,
        headerShown: false,
      }}>
      <Drawer.Screen component={TabNavigator} name={SCREENS.MAIN_TABS} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: colors.surface.white,
    width: '100%',
  },
  drawerContent: {
    gap: spacing.xxl,
  },
});
