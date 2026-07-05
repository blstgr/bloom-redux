import type { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Icon } from '../components/ui/Icon';
import { PhotoGrid } from '../components/ui/PhotoGrid';
import { PlantCard } from '../components/ui/PlantCard';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import {
  SCREENS,
  type HomeScreenProps,
  type RootNavigation,
  type SettingsDrawerParamList,
  type TabParamList,
} from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { colors, layout, spacing } from '../theme';

const EMPTY_SUBTITLE_LINE_HEIGHT = 20;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const rootNavigation = navigation.getParent()?.getParent<RootNavigation>();
  const { getSpeciesById, ownedPlants } = usePlantData();
  const plants = ownedPlants
    .map(ownedPlant => {
      const species = getSpeciesById(ownedPlant.speciesId);
      if (!species) return null;

      return {
        ownedPlant,
        species,
      };
    })
    .filter(item => item != null);
  const openSettings = React.useCallback(() => {
    navigation.getParent<DrawerNavigationProp<SettingsDrawerParamList>>()?.openDrawer();
  }, [navigation]);
  const handleNavigateTab = React.useCallback(
    (screen: keyof TabParamList) => {
      navigation.navigate(screen);
    },
    [navigation],
  );
  const handleAddPlant = React.useCallback(() => {
    rootNavigation?.navigate(SCREENS.ADD_PLANT_STACK);
  }, [rootNavigation]);

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          mode={plants.length > 0 ? 'hero' : 'centered'}
          onRightPress={openSettings}
          rightIcon="more"
          rightLabel="Open settings"
          title={plants.length > 0 ? 'Plant Situation' : undefined}
        />
      )}
      topActionsOverlay={plants.length === 0}
      scrollableContent
      scrollableContentSharesTopGap={plants.length > 0}
      contentLayout="start"
      contentStyle={styles.content}
      bottomActions={(
        <BottomActions
          bottomBar={(
            <MainTabBar
              activeScreen={SCREENS.HOME}
              onAddPlant={handleAddPlant}
              onNavigate={handleNavigateTab}
            />
          )}
        />
      )}>
        {plants.length > 0 ? (
          <PhotoGrid>
            {plants.map(({ ownedPlant }) => (
              <PlantCard
                key={ownedPlant.ownedPlantId}
                accessibilityLabel={`Open ${ownedPlant.customName}`}
                image={ownedPlant.image}
                onPress={() => {
                  rootNavigation?.navigate(SCREENS.PLANT_DETAIL, {
                    ownedPlantId: ownedPlant.ownedPlantId,
                  });
                }}
              />
            ))}
          </PhotoGrid>
        ) : (
          <View style={styles.emptyState}>
            <Icon color={colors.icon.green} name="plant" size="xxl" />
            <AppText align="center" variant="titleXl">
              Keep something alive this week
            </AppText>
            <AppText align="center" style={styles.emptySubtitle}>
              Add a plant to create a watering schedule
            </AppText>
          </View>
        )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  emptyState: {
    alignItems: 'center',
    flexGrow: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptySubtitle: {
    lineHeight: EMPTY_SUBTITLE_LINE_HEIGHT,
  },
});
