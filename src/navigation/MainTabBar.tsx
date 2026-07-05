import React from 'react';

import { NavBar, type NavItem } from '../components/ui/NavBar';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { isWateringDue } from '../features/plants/data/schedule';

import { SCREENS } from './constants';
import type { TabParamList } from './types';

type MainTabBarProps = {
  activeScreen: keyof TabParamList;
  onAddPlant: () => void;
  onNavigate: (screen: keyof TabParamList) => void;
};

type MainTabBarItemKey = keyof TabParamList | typeof SCREENS.ADD_PLANT_STACK;

export function MainTabBar({
  activeScreen,
  onAddPlant,
  onNavigate,
}: MainTabBarProps) {
  const { getSpeciesById, ownedPlants } = usePlantData();
  const dueCount = ownedPlants.filter(ownedPlant => {
    const species = getSpeciesById(ownedPlant.speciesId);
    return species != null && isWateringDue(ownedPlant, species);
  }).length;
  const items = React.useMemo<NavItem<MainTabBarItemKey>[]>(
    () => [
      {
        accessibilityLabel: 'Home',
        icon: 'home',
        key: SCREENS.HOME,
        onPress: () => onNavigate(SCREENS.HOME),
      },
      {
        accessibilityLabel: 'Add plant',
        icon: 'plus',
        key: SCREENS.ADD_PLANT_STACK,
        onPress: onAddPlant,
      },
      {
        accessibilityLabel: 'plant wiki',
        icon: 'library',
        key: SCREENS.LIBRARY,
        onPress: () => onNavigate(SCREENS.LIBRARY),
      },
      {
        accessibilityLabel: 'Water',
        badgeCount: dueCount > 0 ? dueCount : undefined,
        icon: 'water',
        key: SCREENS.WATER,
        onPress: () => onNavigate(SCREENS.WATER),
      },
    ],
    [dueCount, onAddPlant, onNavigate],
  );

  return <NavBar activeKey={activeScreen} items={items} />;
}
