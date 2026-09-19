import React from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { BottomActions } from '../components/ui/BottomActions';
import { Icon } from '../components/ui/Icon';
import { Input, type InputActions } from '../components/ui/Input';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import type { PlantSpecies } from '../features/plants/data/types';
import { SCREENS, type LibraryScreenProps, type RootNavigation, type TabParamList } from '../navigation';
import { MainTabBar } from '../navigation/MainTabBar';
import { searchSpecies } from '../services/plantApi';
import type { PerenualSpeciesListItem } from '../services/types';
import { colors, layout, radii, sizes, spacing } from '../theme';

const MAX_RESULTS = 8;
const RANK_STARTS_WITH = 0;
const RANK_WORD_BOUNDARY = 1;
export const RANK_SCIENTIFIC_NAME_MATCH = 2;
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

/** Scientific names carry punctuation ("Maranta leuconeura 'Erythroneura'") that a plain word
 * split leaves attached ("'erythroneura'") — strip anything that isn't a letter from each token's
 * edges before comparing. */
function getScientificNameTokens(scientificName: string[]): string[] {
  return scientificName
    .flatMap(name => name.toLowerCase().split(/\s+/))
    .map(token => token.replace(/^[^a-z]+|[^a-z]+$/g, ''))
    .filter(token => token.length > 0);
}

/**
 * Perenual's own search ranking is a poor fit for search-as-you-type: it matches substrings
 * across every field (scientific name, family, etc), not just the displayed common name, so a
 * query like "pa" comes back with real matches ("Paperbark Maple") mixed in with names that only
 * coincidentally contain the query mid-word ("Japanese Maple" via "ja-PA-nese"), with no
 * relevance signal distinguishing them. Rank what we did get — starts-with (common name) first,
 * then a word-boundary match (a new word in the common name starts with the query), then an exact
 * whole-word match against a scientific-name token (so searching a genus like "Maranta" still
 * finds species whose common name is something unrelated-looking like "prayer plant") — and drop
 * plain no-boundary substring matches entirely (e.g. "palm" merely prefixing "palmatum", not
 * equal to it), rather than pad the list with weak, coincidental hits.
 */
export function rankByRelevance(item: PerenualSpeciesListItem, normalizedQuery: string): number | null {
  const normalizedName = item.common_name.toLowerCase();
  if (normalizedName.startsWith(normalizedQuery)) return RANK_STARTS_WITH;
  if (normalizedName.includes(` ${normalizedQuery}`)) return RANK_WORD_BOUNDARY;

  // Match each typed word against the scientific-name tokens individually, not the whole query
  // as one token — otherwise a genus+species query ("Hoya carnosa") could never match, since no
  // single token ever equals a multi-word string.
  const scientificNameTokens = getScientificNameTokens(item.scientific_name);
  const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 0);
  if (queryTokens.every(token => scientificNameTokens.includes(token))) return RANK_SCIENTIFIC_NAME_MATCH;

  return null;
}

export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const rootNavigation = navigation.getParent()?.getParent<RootNavigation>();
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
      searchSpecies(normalizedQuery)
        .then(items => {
          if (searchRequestIdRef.current !== requestId) return;
          // Only keep results actually relevant to what was typed (see rankByRelevance above for
          // why Perenual's own matches need this), ranked so the closest matches come first; no
          // weak coincidental substring hits.
          const relevantItems = items
            .map(item => ({ item, rank: rankByRelevance(item, normalizedQuery) }))
            .filter((entry): entry is { item: PerenualSpeciesListItem; rank: number } => entry.rank !== null)
            .sort((a, b) => a.rank - b.rank)
            .map(entry => entry.item);
          setResults(relevantItems.slice(0, MAX_RESULTS));
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
    (species: PlantSpecies) => {
      addSearchHistoryEntry(species);
      rootNavigation?.navigate(SCREENS.SPECIES_INFO, { speciesId: species.speciesId });
    },
    [addSearchHistoryEntry, rootNavigation],
  );
  // Navigates immediately rather than waiting for the full species (facts, photo, generated
  // copy) to resolve first — SpeciesInfoScreen resolves it in place and shows its own loading
  // state there, which reads as "this article is loading" rather than an unexplained delay/lag
  // before the tap even seems to register.
  const handleSelectSearchResult = React.useCallback(
    (item: PerenualSpeciesListItem) => {
      rootNavigation?.navigate(SCREENS.SPECIES_INFO, {
        speciesId: String(item.id),
        speciesName: item.common_name,
      });
    },
    [rootNavigation],
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
