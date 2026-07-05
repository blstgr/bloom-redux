import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AddPlantCameraScreen } from '../screens/AddPlantCameraScreen';
import { AddPlantLoaderScreen } from '../screens/AddPlantLoaderScreen';
import { AddPlantPrefilledScreen } from '../screens/AddPlantPrefilledScreen';

import { SCREENS } from './constants';
import type { AddPlantStackParamList } from './types';

const Stack = createNativeStackNavigator<AddPlantStackParamList>();

export function AddPlantStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={AddPlantCameraScreen} name={SCREENS.ADD_PLANT_CAMERA} />
      <Stack.Screen component={AddPlantLoaderScreen} name={SCREENS.ADD_PLANT_LOADER} />
      <Stack.Screen
        component={AddPlantPrefilledScreen}
        name={SCREENS.ADD_PLANT_PREFILLED}
      />
    </Stack.Navigator>
  );
}

