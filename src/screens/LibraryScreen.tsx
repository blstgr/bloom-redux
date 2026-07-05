import type { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { GlassView } from '../components/ui/GlassView';
import { Icon } from '../components/ui/Icon';
import { Input, type InputActions } from '../components/ui/Input';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import {
  SCREENS,
  type LibraryScreenProps,
  type RootNavigation,
  type SettingsDrawerParamList,
  type TabParamList,
} from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { colors, layout, radii, sizes, spacing } from '../theme';

const MAX_RESULTS = 8;
const LIBRARY_PANEL_WIDTH = 327;
const LIBRARY_SUBTITLE_LINE_HEIGHT = 20.4;
// ScreenLayout's bottomActions floats over non-scrollable content rather than reserving flow
// space for it — mirrors the reservation ScreenLayout itself applies for scrollable content,
// since this screen's content isn't scrollable but still needs to stop above the floating bar.
const FLOATING_BOTTOM_ACTIONS_STACKED_GAP = spacing.xxl;

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const rootNavigation = navigation.getParent()?.getParent<RootNavigation>();
  const { pendingLibrarySearch, setPendingLibrarySearch, species } = usePlantData();
  const safeAreaInsets = useSafeAreaInsets();
  const [query, setQuery] = React.useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const [containerHeight, setContainerHeight] = React.useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = React.useState<number | null>(null);
  const floatingBottomActionsReservedHeight =
    safeAreaInsets.bottom + sizes.nav.item + FLOATING_BOTTOM_ACTIONS_STACKED_GAP;
  const resultsMaxHeight =
    containerHeight != null && headerHeight != null
      ? containerHeight - headerHeight - spacing.xs - floatingBottomActionsReservedHeight
      : undefined;

  React.useEffect(() => {
    if (pendingLibrarySearch == null) return;
    setQuery(pendingLibrarySearch);
    setPendingLibrarySearch(null);
  }, [pendingLibrarySearch, setPendingLibrarySearch]);
  const results = React.useMemo(
    () =>
      normalizedQuery.length === 0
        ? []
        : species
            .filter(item => item.speciesName.toLowerCase().includes(normalizedQuery))
            .slice(0, MAX_RESULTS),
    [normalizedQuery, species],
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
  const handleSearchByPhoto = React.useCallback(() => {
    rootNavigation?.navigate(SCREENS.ADD_PLANT_STACK, {
      screen: SCREENS.ADD_PLANT_CAMERA,
      params: { mode: 'search' },
    });
  }, [rootNavigation]);
  const inputActions = React.useMemo<InputActions>(
    () => [
      query.length > 0
        ? {
            accessibilityLabel: 'Clear plant search',
            icon: 'close',
            iconSize: 'md',
            key: 'clear-search',
            onPress: () => setQuery(''),
          }
        : {
            accessibilityLabel: 'Search plant by photo',
            icon: 'camera',
            iconSize: 'md',
            key: 'search-by-photo',
            onPress: handleSearchByPhoto,
          },
    ],
    [handleSearchByPhoto, query.length],
  );

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          onRightPress={openSettings}
          rightIcon="more"
          rightLabel="Open settings"
        />
      )}
      contentLayout="start"
      contentStyle={styles.content}
      bottomActions={(
        <BottomActions
          bottomBar={(
            <MainTabBar
              activeScreen={SCREENS.LIBRARY}
              onAddPlant={handleAddPlant}
              onNavigate={handleNavigateTab}
            />
          )}
        />
      )}>
      <Pressable
        accessible={false}
        onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
        onPress={Keyboard.dismiss}
        style={styles.dismissArea}>
        <View style={styles.libraryPanel}>
          <View
            onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
            style={styles.header}>
            <Icon color={colors.icon.green} name="sun" size="xxl" />
            <AppText align="center" variant="titleXl">
              Potential Victims
            </AppText>
            <AppText align="center" style={styles.subtitle}>
              Search any plant to see if it is ready for you... and if you are ready for it.
            </AppText>
            <View style={styles.searchArea}>
              <Input
                accessibilityLabel="Search plant wiki"
                actions={inputActions}
                leadingIcon="search"
                onChangeText={setQuery}
                value={query}
              />
            </View>
          </View>
          {results.length > 0 ? (
            <GlassView
              fallbackColor={colors.surface.creamWarm}
              radius={radii.lg}
              style={styles.results}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={resultsMaxHeight != null ? { maxHeight: resultsMaxHeight } : undefined}>
                <View accessibilityLabel="Plant wiki search results">
                  {results.map(result => (
                    <Pressable
                      accessibilityLabel={`Open ${result.speciesName}`}
                      accessibilityRole="button"
                      key={result.speciesId}
                      onPress={() => {
                        rootNavigation?.navigate(SCREENS.SPECIES_INFO, {
                          speciesId: result.speciesId,
                        });
                      }}
                      style={styles.resultRow}>
                      <Icon color={colors.icon.primary} name="search" size="sm" />
                      <AppText>{result.speciesName}</AppText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </GlassView>
          ) : null}
        </View>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  dismissArea: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  libraryPanel: {
    alignItems: 'center',
    width: LIBRARY_PANEL_WIDTH,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    height: sizes.input.height,
    paddingHorizontal: spacing.md,
  },
  results: {
    borderRadius: radii.lg,
    marginTop: spacing.xs,
    width: '100%',
  },
  searchArea: {
    marginTop: spacing.md,
    width: '100%',
  },
  subtitle: {
    lineHeight: LIBRARY_SUBTITLE_LINE_HEIGHT,
  },
});
