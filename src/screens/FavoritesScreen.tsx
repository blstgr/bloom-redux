import React from 'react';
import { StyleSheet } from 'react-native';

import { BottomActions } from '../components/ui/BottomActions';
import { PhotoGrid } from '../components/ui/PhotoGrid';
import { PlantCard } from '../components/ui/PlantCard';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { Tabs } from '../components/ui/Tabs';
import { TopActions } from '../components/ui/TopActions';
import { FAVORITES_TABS, matchesTab, type FavoritesTabKey } from '../features/plants/data/favoritesTabs';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import type { PlantSpecies } from '../features/plants/data/types';
import { SCREENS, type FavoritesScreenProps, useTabScreenNavigation } from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { useAppSelector } from '../store/hooks';
import { layout, spacing } from '../theme';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { navigateTab, openAddPlant, openSettings, openSpeciesInfo } = useTabScreenNavigation(navigation);
  const favorites = useAppSelector(state => state.favorites);
  const { getSpeciesById } = usePlantData();
  const [activeTab, setActiveTab] = React.useState(FAVORITES_TABS[0].key);
  const favoritedSpecies = favorites
    .map(favorite => getSpeciesById(favorite.speciesId))
    .filter((species): species is PlantSpecies => species != null);
  // Only offer tabs that actually match something favorited — e.g. favoriting only easy plants
  // shouldn't surface an always-empty "Somewhat Needy" tab. "All" always stays.
  const availableTabs = FAVORITES_TABS.filter(
    tab => tab.key === 'all' || favoritedSpecies.some(species => matchesTab(species, tab.key)),
  );
  const effectiveActiveTab = availableTabs.some(tab => tab.key === activeTab) ? activeTab : 'all';
  const visibleSpecies = favoritedSpecies.filter(species => matchesTab(species, effectiveActiveTab));


  // The heart nav item only exists while favorites.length > 0, so this screen has no designed
  // empty state — it's reachable empty only for an instant (e.g. unfavoriting your last plant
  // while already here), and falls back to Home rather than showing a dedicated empty screen.
  //
  // Keyed on `favorites` (the Redux list) rather than the resolved `favoritedSpecies`, so this
  // and MainTabBar's heart-item condition read the *same* value. Keying it on the resolved list
  // would mean an unresolvable species leaves the heart item visible while this screen bounces
  // straight back to Home the moment it's tapped.
  React.useEffect(() => {
    if (favoritedSpecies.length === 0) navigation.navigate(SCREENS.HOME);
  }, [favoritedSpecies.length, navigation]);

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          mode="hero"
          onRightPress={openSettings}
          rightIcon="more"
          rightLabel="Open settings"
          title="The Maybe List"
        />
      )}
      scrollableContent
      scrollableContentSharesTopGap
      contentLayout="start"
      contentStyle={styles.content}
      bottomActions={(
        <BottomActions
          bottomBar={(
            <MainTabBar
              activeScreen={SCREENS.FAVORITES}
              onAddPlant={openAddPlant}
              onNavigate={navigateTab}
            />
          )}
        />
      )}>
      <Tabs
        activeKey={effectiveActiveTab}
        // Tabs is generic (its own tab data could come from anywhere, e.g. Storybook), so its
        // onTabPress hands back a plain string — safe to narrow back to FavoritesTabKey here since
        // `tabs` above is always sourced from FAVORITES_TABS, whose own keys are the only ones
        // Tabs can ever report.
        onTabPress={key => setActiveTab(key as FavoritesTabKey)}
        tabs={availableTabs}
      />
      <PhotoGrid>
        {visibleSpecies.map(species => (
          <PlantCard
            key={species.speciesId}
            accessibilityLabel={`Open ${species.speciesName}`}
            image={species.image}
            onPress={() => {
              openSpeciesInfo({ speciesId: species.speciesId });
            }}
          />
        ))}
      </PhotoGrid>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingHorizontal: layout.screenPadding,
  },
});
