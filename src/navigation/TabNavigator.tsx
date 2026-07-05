import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { WaterScreen } from '../screens/WaterScreen';

import { SCREENS } from './constants';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

function renderNoTabBar() {
  return null;
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      // react-native-screens detaching/freezing inactive tabs races with focusing a TextInput
      // on the active one (a keyboard session opens then immediately closes) — see
      // https://github.com/software-mansion/react-native-screens/issues/1342
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={renderNoTabBar}>
      <Tab.Screen component={HomeScreen} name={SCREENS.HOME} />
      <Tab.Screen component={LibraryScreen} name={SCREENS.LIBRARY} />
      <Tab.Screen component={WaterScreen} name={SCREENS.WATER} />
    </Tab.Navigator>
  );
}
