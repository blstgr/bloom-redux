import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { AlertModal } from '../components/ui/AlertModal';
import { AppText } from '../components/ui/AppText';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { SCREENS, type SpeciesInfoScreenProps } from '../navigation';
import { layout, spacing } from '../theme';

const ARTICLE_HERO_HEIGHT = 388;
const ARTICLE_HERO_COLLAPSED_HEIGHT = 141;
const ARTICLE_HERO_COLLAPSE_DISTANCE = ARTICLE_HERO_HEIGHT - ARTICLE_HERO_COLLAPSED_HEIGHT;
const ARTICLE_PARAGRAPH_COUNT = 5;
const SCROLL_EVENT_THROTTLE_MS = 16;

export function SpeciesInfoScreen({ navigation, route }: SpeciesInfoScreenProps) {
  const { getSpeciesById } = usePlantData();
  const species = getSpeciesById(route.params?.speciesId);
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, ARTICLE_HERO_COLLAPSE_DISTANCE],
      [ARTICLE_HERO_HEIGHT, ARTICLE_HERO_COLLAPSED_HEIGHT],
      Extrapolation.CLAMP,
    ),
  }));

  const handleCloseError = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace(SCREENS.SETTINGS_DRAWER, {
      params: { screen: SCREENS.HOME },
      screen: SCREENS.MAIN_TABS,
    });
  }, [navigation]);

  if (!species) {
    return (
      <AlertModal
        onClose={handleCloseError}
        text="Plant info could not be opened because no species was selected."
        variant="error"
        visible
      />
    );
  }

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          onRightPress={() => navigation.goBack()}
          rightIcon="close"
          rightLabel="Back"
        />
      )}
      topActionsOverlay>
      <View style={styles.content}>
        <Animated.ScrollView
          contentContainerStyle={styles.articleScrollContent}
          contentInsetAdjustmentBehavior="never"
          onScroll={handleScroll}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
          showsVerticalScrollIndicator={false}
          style={styles.articleScroll}>
          <View style={styles.articleBody}>
            <View style={styles.titleStack}>
              <AppText variant="titleXl">{species.speciesName}</AppText>
              <AppText tone="highlighted">{species.category}</AppText>
            </View>
            {Array.from({ length: ARTICLE_PARAGRAPH_COUNT }, (_, index) => (
              <AppText key={`${species.speciesId}-paragraph-${index}`}>
                {species.description}
              </AppText>
            ))}
          </View>
        </Animated.ScrollView>
        <Animated.View style={[styles.heroImage, heroStyle]}>
          <ImageBackground
            resizeMode="cover"
            source={species.detailImage}
            style={styles.heroImageFill}
          />
        </Animated.View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  articleBody: {
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
  },
  articleScroll: {
    flex: 1,
    zIndex: 0,
  },
  articleScrollContent: {
    paddingTop: ARTICLE_HERO_HEIGHT,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  heroImageFill: {
    flex: 1,
    width: '100%',
  },
  titleStack: {
    gap: spacing.xxs,
  },
});
