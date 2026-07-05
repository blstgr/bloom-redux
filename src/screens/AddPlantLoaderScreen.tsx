import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AlertModal } from '../components/ui/AlertModal';
import { BottomActions } from '../components/ui/BottomActions';
import { Loader } from '../components/ui/Loader';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { SCREENS, type AddPlantLoaderScreenProps } from '../navigation';
import { sizes } from '../theme';

const RECOGNITION_DELAY_MS = 600;

export function AddPlantLoaderScreen({
  navigation,
  route,
}: AddPlantLoaderScreenProps) {
  const { addSearchHistoryEntry, getDetectionById, getSpeciesById, setPendingLibrarySearch } = usePlantData();
  const captureId = route.params?.captureId;
  const mode = route.params?.mode;
  const detection = getDetectionById(captureId);
  const species = getSpeciesById(detection?.speciesId);
  const previewImage = detection?.image;

  React.useEffect(() => {
    if (!detection || !species) return undefined;

    const timeout = setTimeout(() => {
      if (mode === 'search') {
        // Prefills the Library search box for whenever the user closes the article and lands
        // back on it — no need to auto-focus, so no timing race with the screen transition.
        setPendingLibrarySearch(species.speciesName);
        // This flow never passes through the Library's own result rows (handleOpenSpecies),
        // so the detected species has to be recorded here instead, or it would never show
        // up in search history.
        addSearchHistoryEntry(species);
        // Replaces the camera stack in place (rather than pushing on top of it), so closing
        // the article naturally returns to the screen the camera flow was launched from.
        // The action bubbles up to the root stack since SPECIES_INFO isn't a screen in this
        // (AddPlantStack) navigator, replacing the AddPlantStack route itself there.
        navigation.replace(SCREENS.SPECIES_INFO, {
          speciesId: species.speciesId,
        });
        return;
      }

      navigation.navigate(SCREENS.ADD_PLANT_PREFILLED, {
        detectionId: captureId,
      });
    }, RECOGNITION_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [addSearchHistoryEntry, captureId, detection, mode, navigation, setPendingLibrarySearch, species]);

  if (!detection || !species || !previewImage) {
    return (
      <AlertModal
        onClose={() => navigation.replace(SCREENS.ADD_PLANT_CAMERA)}
        text="Plant recognition could not start because no captured plant photo was found."
        variant="error"
        visible
      />
    );
  }

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          onRightPress={() => navigation.getParent()?.goBack()}
          rightIcon="close"
          rightLabel="Close recognition"
        />
      )}
      bottomActionsOverlay={false}
      bottomActions={<BottomActions bottomBar={<View style={styles.hiddenSnapFooter} />} />}>
      <View style={styles.cameraPreview}>
        <Image source={previewImage} style={styles.previewImage} />
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cameraPreview: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  hiddenSnapFooter: {
    height: sizes.nav.item,
    width: sizes.nav.item,
  },
  loaderOverlay: {
    alignItems: 'center',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
});
