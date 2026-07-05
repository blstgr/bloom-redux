import React from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Icon } from '../components/ui/Icon';
import { Input, type InputActions } from '../components/ui/Input';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import type { PlantSpecies } from '../features/plants/data/mockPlants';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { SCREENS, type LibraryScreenProps, type RootNavigation, type TabParamList } from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { colors, layout, radii, sizes, spacing } from '../theme';

const MAX_RESULTS = 8;
const LIBRARY_PANEL_WIDTH = 327;
const LIBRARY_SUBTITLE_LINE_HEIGHT = 20.4;
// Matches searchWrap's own marginTop below, so the floating search bar sits the same
// distance under the safe area as it did before it floated.
const SEARCH_BAR_TOP_GAP = spacing.xl;
const SEARCH_RESULTS_TOP_GAP = spacing.md;

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const rootNavigation = navigation.getParent()?.getParent<RootNavigation>();
  const {
    addSearchHistoryEntry,
    pendingLibrarySearch,
    searchHistory,
    setPendingLibrarySearch,
    species,
  } = usePlantData();
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const showHistory = !isSearching && isFocused && searchHistory.length > 0;
  const showList = isSearching || showHistory;

  React.useEffect(() => {
    if (pendingLibrarySearch == null) return;
    setQuery(pendingLibrarySearch);
    setPendingLibrarySearch(null);
  }, [pendingLibrarySearch, setPendingLibrarySearch]);
  // Reset once this tab regains focus (e.g. closing the species wiki page), rather than the
  // moment a result is selected — clearing it immediately flashed the idle icon/title/subtitle
  // behind the new screen while it was still transitioning in.
  React.useEffect(
    () =>
      navigation.addListener?.('focus', () => {
        if (pendingLibrarySearch == null) {
          setQuery('');
        }
      }),
    [navigation, pendingLibrarySearch],
  );
  const results = React.useMemo(
    () =>
      normalizedQuery.length === 0
        ? []
        : species
            .filter(item => item.speciesName.toLowerCase().includes(normalizedQuery))
            .slice(0, MAX_RESULTS),
    [normalizedQuery, species],
  );

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
  const handleOpenSpecies = React.useCallback(
    (selected: PlantSpecies) => {
      addSearchHistoryEntry(selected);
      rootNavigation?.navigate(SCREENS.SPECIES_INFO, { speciesId: selected.speciesId });
    },
    [addSearchHistoryEntry, rootNavigation],
  );
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
        <View style={styles.searchWrap}>
          <Input
            accessibilityLabel="Search plant wiki"
            actions={inputActions}
            leadingIcon="search"
            onBlur={() => setIsFocused(false)}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            size="large"
            value={query}
          />
        </View>
      )}
      contentStyle={[
        styles.content,
        { paddingTop: insets.top + SEARCH_BAR_TOP_GAP + sizes.input.heightLarge + SEARCH_RESULTS_TOP_GAP },
      ]}
      scrollableContent
      topActionsOverlay
      bottomActionsOverlay={false}
      stackedGap={spacing.md}
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
        onPress={Keyboard.dismiss}
        style={[styles.dismissArea, !showList && styles.dismissAreaCentered]}>
        <View style={styles.libraryPanel}>
          {isSearching ? (
            results.length > 0 ? (
              <SearchResultSection heading="Suggestions" items={results} onSelect={handleOpenSpecies} />
            ) : null
          ) : showHistory ? (
            <SearchResultSection heading="History" items={searchHistory} onSelect={handleOpenSpecies} />
          ) : isFocused ? null : (
            <>
              <Icon color={colors.icon.green} name="sun" size="xxl" />
              <AppText align="center" variant="titleXl">
                Potential Victims
              </AppText>
              <AppText align="center" style={styles.subtitle}>
                Search any plant to see if it is ready for you... and if you are ready for it.
              </AppText>
            </>
          )}
        </View>
      </Pressable>
    </ScreenLayout>
  );
}

function SearchResultSection({
  heading,
  items,
  onSelect,
}: {
  heading: string;
  items: PlantSpecies[];
  onSelect: (species: PlantSpecies) => void;
}) {
  return (
    <View accessibilityLabel={`Plant wiki ${heading.toLowerCase()}`} style={styles.results}>
      <View style={styles.resultsHeadingRow}>
        <AppText variant="titleS">{heading}</AppText>
      </View>
      {items.map(item => (
        <Pressable
          accessibilityLabel={`Open ${item.speciesName}`}
          accessibilityRole="button"
          key={item.speciesId}
          onPress={() => onSelect(item)}
          style={styles.resultRow}>
          <Icon color={colors.icon.primary} name="search" size="sm" />
          <AppText>{item.speciesName}</AppText>
        </Pressable>
      ))}
    </View>
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
  dismissAreaCentered: {
    justifyContent: 'center',
  },
  libraryPanel: {
    alignItems: 'center',
    gap: spacing.md,
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
    width: '100%',
  },
  resultsHeadingRow: {
    height: sizes.input.height,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  searchWrap: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    width: LIBRARY_PANEL_WIDTH,
  },
  subtitle: {
    lineHeight: LIBRARY_SUBTITLE_LINE_HEIGHT,
  },
});
