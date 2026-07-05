import type { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Icon } from '../components/ui/Icon';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { buildPlantSchedule, getScheduleBaseDate, isWateringDue } from '../features/plants/data/schedule';
import { WateringCard } from '../features/watering/components/WateringCard';
import {
  SCREENS,
  type RootNavigation,
  type SettingsDrawerParamList,
  type TabParamList,
  type WaterScreenProps,
} from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { colors, layout, spacing } from '../theme';

const FIRST_SCHEDULE_ITEM_INDEX = 0;
const EMPTY_SUBTITLE_LINE_HEIGHT = 20;
const WATERING_CARD_GAP = 4;

export function WaterScreen({ navigation }: WaterScreenProps) {
  const rootNavigation = navigation.getParent()?.getParent<RootNavigation>();
  const { getSpeciesById, markWatered, ownedPlants } = usePlantData();
  const scheduledPlants = ownedPlants
    .map(ownedPlant => {
      const species = getSpeciesById(ownedPlant.speciesId);
      if (!species || !isWateringDue(ownedPlant, species)) return null;

      return {
        ownedPlant,
        schedule: buildPlantSchedule(ownedPlant, species),
        species,
      };
    })
    .filter(item => item != null)
    .sort(
      (a, b) => getScheduleBaseDate(a.ownedPlant).getTime() - getScheduleBaseDate(b.ownedPlant).getTime(),
    );

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
          mode={scheduledPlants.length > 0 ? 'hero' : 'centered'}
          onRightPress={openSettings}
          rightIcon="more"
          rightLabel="Open settings"
          title={scheduledPlants.length > 0 ? 'Needs Water' : undefined}
        />
      )}
      topActionsOverlay={scheduledPlants.length === 0}
      scrollableContent
      scrollableContentSharesTopGap={scheduledPlants.length > 0}
      contentLayout="start"
      contentStyle={styles.content}
      bottomActions={(
        <BottomActions
          bottomBar={(
            <MainTabBar
              activeScreen={SCREENS.WATER}
              onAddPlant={handleAddPlant}
              onNavigate={handleNavigateTab}
            />
          )}
        />
      )}>
        {scheduledPlants.length > 0 ? (
          <View style={styles.notificationState}>
            {scheduledPlants.map(({ ownedPlant, schedule }) => {
              const currentSchedule = schedule[FIRST_SCHEDULE_ITEM_INDEX];

              return (
                <WateringCard
                  key={ownedPlant.ownedPlantId}
                  accessibilityLabel={`Open ${ownedPlant.customName}`}
                  day={currentSchedule.day}
                  image={ownedPlant.image}
                  month={currentSchedule.month}
                  onDismiss={() => markWatered(ownedPlant.ownedPlantId)}
                  onPress={() => {
                    rootNavigation?.navigate(SCREENS.PLANT_DETAIL, {
                      ownedPlantId: ownedPlant.ownedPlantId,
                    });
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon color={colors.icon.green} name="dropHappy" size="xxl" />
            <AppText align="center" variant="titleXl">Hydrated</AppText>
            <AppText align="center" style={styles.emptySubtitle}>
              No watering tasks today
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
  notificationState: {
    gap: WATERING_CARD_GAP,
  },
});
