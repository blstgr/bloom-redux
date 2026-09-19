import React from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Icon } from '../components/ui/Icon';
import { Input, type InputActions } from '../components/ui/Input';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { searchSpeciesByRelevance } from '../features/plants/data/speciesSearch';
import type { PlantSpecies } from '../features/plants/data/types';
import { SCREENS, type LibraryScreenProps, useTabScreenNavigation } from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import type { PerenualSpeciesListItem } from '../services/types';
import { colors, layout, radii, sizes, spacing } from '../theme';

const LIBRARY_PANEL_WIDTH = 327;
const LIBRARY_SUBTITLE_LINE_HEIGHT = 20.4;
// Matches searchWrap's own marginTop below, so the floating search bar sits the same
// distance under the safe area as it did before it floated.
const SEARCH_BAR_TOP_GAP = spacing.xl;
const SEARCH_RESULTS_TOP_GAP = spacing.md;
// Standard search-as-you-type practice (Google, GitHub, etc). Below this, Perenual's substring
// match is too broad to be useful — nearly every name contains any single common letter somewhere.
const MIN_SEARCH_QUERY_LENGTH = 2;
// Delays the actual Perenual request until typing pauses, so a full word costs one request
// instead of one per keystroke — Perenual's free-tier daily cap is easy to exhaust otherwise.
const SEARCH_DEBOUNCE_MS = 350;

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const { navigateTab, openAddPlant, openAddPlantPhotoSearch, openSpeciesInfo } = useTabScreenNavigation(navigation);
  const {
    addSearchHistoryEntry,
    pendingLibrarySearch,
    searchHistory,
    setPendingLibrarySearch,
  } = usePlantData();
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [results, setResults] = React.useState<PerenualSpeciesListItem[]>([]);
  const [searchError, setSearchError] = React.useState(false);
  const searchRequestIdRef = React.useRef(0);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
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

  React.useEffect(() => {
    if (!isSearching) {
      setResults([]);
      setSearchError(false);
      return undefined;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const debounceTimeout = setTimeout(() => {
      searchSpeciesByRelevance(normalizedQuery)
        .then(items => {
          if (searchRequestIdRef.current !== requestId) return;
          setResults(items);
          setSearchError(false);
        })
        .catch(() => {
          if (searchRequestIdRef.current !== requestId) return;
          setResults([]);
          setSearchError(true);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceTimeout);
  }, [isSearching, normalizedQuery]);

  const handleOpenSpecies = React.useCallback(
    (species: PlantSpecies) => {
      addSearchHistoryEntry(species);
      openSpeciesInfo({ speciesId: species.speciesId });
    },
    [addSearchHistoryEntry, openSpeciesInfo],
  );
  // Navigates immediately rather than waiting for the full species (facts, photo, generated
  // copy) to resolve first — SpeciesInfoScreen resolves it in place and shows its own loading
  // state there, which reads as "this article is loading" rather than an unexplained delay/lag
  // before the tap even seems to register.
  const handleSelectSearchResult = React.useCallback(
    (item: PerenualSpeciesListItem) => {
      openSpeciesInfo({
        speciesId: String(item.id),
        speciesName: item.common_name,
      });
    },
    [openSpeciesInfo],
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
            onPress: openAddPlantPhotoSearch,
          },
    ],
    [openAddPlantPhotoSearch, query.length],
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
              onAddPlant={openAddPlant}
              onNavigate={navigateTab}
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
            searchError ? (
              <AppText align="center" style={styles.subtitle}>
                Couldn't load search results. Check your connection and try again.
              </AppText>
            ) : results.length > 0 ? (
              <SearchResultSection
                heading="Suggestions"
                items={results}
                keyExtractor={item => String(item.id)}
                labelExtractor={item => item.common_name}
                onSelect={handleSelectSearchResult}
              />
            ) : null
          ) : showHistory ? (
            <SearchResultSection
              heading="History"
              items={searchHistory}
              keyExtractor={item => item.speciesId}
              labelExtractor={item => item.speciesName}
              onSelect={handleOpenSpecies}
            />
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

function SearchResultSection<Item>({
  heading,
  items,
  keyExtractor,
  labelExtractor,
  onSelect,
}: {
  heading: string;
  items: Item[];
  keyExtractor: (item: Item) => string;
  labelExtractor: (item: Item) => string;
  onSelect: (item: Item) => void;
}) {
  return (
    <View accessibilityLabel={`Plant wiki ${heading.toLowerCase()}`} style={styles.results}>
      <View style={styles.resultsHeadingRow}>
        <AppText variant="titleS">{heading}</AppText>
      </View>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={`Open ${labelExtractor(item)}`}
            accessibilityRole="button"
            onPress={() => onSelect(item)}
            style={styles.resultRow}>
            <Icon color={colors.icon.primary} name="search" size="sm" />
            <AppText>{labelExtractor(item)}</AppText>
          </Pressable>
        )}
        scrollEnabled={false}
      />
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
