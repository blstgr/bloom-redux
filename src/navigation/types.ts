import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { SCREENS } from './constants';

export type AddPlantCaptureMode = 'add' | 'search';

export type AddPlantStackParamList = {
  [SCREENS.ADD_PLANT_CAMERA]: { mode?: AddPlantCaptureMode } | undefined;
  [SCREENS.ADD_PLANT_LOADER]: { captureId?: string; mode?: AddPlantCaptureMode } | undefined;
  [SCREENS.ADD_PLANT_PREFILLED]: { detectionId?: string } | undefined;
};

export type TabParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.LIBRARY]: undefined;
  [SCREENS.WATER]: undefined;
};

export type SettingsDrawerParamList = {
  [SCREENS.MAIN_TABS]: NavigatorScreenParams<TabParamList> | undefined;
};

export type RootStackParamList = {
  [SCREENS.AUTH_START]: undefined;
  [SCREENS.SETTINGS_DRAWER]: NavigatorScreenParams<SettingsDrawerParamList> | undefined;
  [SCREENS.ADD_PLANT_STACK]: NavigatorScreenParams<AddPlantStackParamList> | undefined;
  [SCREENS.PLANT_DETAIL]: { ownedPlantId?: string } | undefined;
  [SCREENS.SPECIES_INFO]: { speciesId?: string } | undefined;
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export type AuthStartScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.AUTH_START
>;

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, typeof SCREENS.HOME>,
  CompositeScreenProps<
    DrawerScreenProps<SettingsDrawerParamList, typeof SCREENS.MAIN_TABS>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type WaterScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, typeof SCREENS.WATER>,
  CompositeScreenProps<
    DrawerScreenProps<SettingsDrawerParamList, typeof SCREENS.MAIN_TABS>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type LibraryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, typeof SCREENS.LIBRARY>,
  CompositeScreenProps<
    DrawerScreenProps<SettingsDrawerParamList, typeof SCREENS.MAIN_TABS>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AddPlantCameraScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AddPlantStackParamList, typeof SCREENS.ADD_PLANT_CAMERA>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AddPlantLoaderScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AddPlantStackParamList, typeof SCREENS.ADD_PLANT_LOADER>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AddPlantPrefilledScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AddPlantStackParamList, typeof SCREENS.ADD_PLANT_PREFILLED>,
  NativeStackScreenProps<RootStackParamList>
>;

export type PlantDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.PLANT_DETAIL
>;

export type SpeciesInfoScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.SPECIES_INFO
>;
