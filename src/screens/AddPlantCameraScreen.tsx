import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

import { AlertModal } from '../components/ui/AlertModal';
import { BottomActions } from '../components/ui/BottomActions';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { TopActions } from '../components/ui/TopActions';
import { mockSpecies } from '../features/plants/data/mockPlants';
import { usePlantData } from '../features/plants/data/PlantDataProvider';
import { SCREENS, type AddPlantCameraScreenProps } from '../navigation';
import { sizes } from '../theme';

const CAMERA_CAPTURE_QUALITY = 0.8;
// Temporary dev/simulator mock user capture: iOS Simulator has no real camera, but the
// add/search camera flow still needs to remain navigable. Remove this fallback for release
// once real device capture is the only supported path.
const TEMP_SIMULATOR_CAMERA_IMAGE = mockSpecies[0].detailImage;
const CAMERA_UNAVAILABLE_ERROR_CODE = 'camera_unavailable';

export function AddPlantCameraScreen({ navigation, route }: AddPlantCameraScreenProps) {
  const { createDetection } = usePlantData();
  const mode = route.params?.mode;
  const [alertText, setAlertText] = React.useState<string | null>(null);
  const [capturing, setCapturing] = React.useState(false);
  const capturingRef = React.useRef(false);

  const continueWithImage = React.useCallback((image: Parameters<typeof createDetection>[0]) => {
    const detection = createDetection(image);
    navigation.navigate(SCREENS.ADD_PLANT_LOADER, {
      captureId: detection.detectionId,
      mode,
    });
  }, [createDetection, mode, navigation]);

  const handleCapture = React.useCallback(async () => {
    if (capturingRef.current) return;
    capturingRef.current = true;
    setCapturing(true);

    let result;
    try {
      result = await launchCamera({
        cameraType: 'back',
        mediaType: 'photo',
        quality: CAMERA_CAPTURE_QUALITY,
        saveToPhotos: false,
      });
    } catch {
      continueWithImage(TEMP_SIMULATOR_CAMERA_IMAGE);
      return;
    } finally {
      capturingRef.current = false;
      setCapturing(false);
    }

    if (result.didCancel) return;

    const imageUri = result.assets?.[0]?.uri;
    if (result.errorCode || !imageUri) {
      if (result.errorCode === CAMERA_UNAVAILABLE_ERROR_CODE) {
        continueWithImage(TEMP_SIMULATOR_CAMERA_IMAGE);
        return;
      }

      setAlertText(result.errorMessage ?? 'Camera could not capture a plant photo. Try again.');
      return;
    }

    continueWithImage({ uri: imageUri });
  }, [continueWithImage]);

  return (
    <ScreenLayout
      topActions={(
        <TopActions
          leftIcon="flashOff"
          leftLabel="Flash off"
          onLeftPress={() => undefined}
          onRightPress={() => navigation.getParent()?.goBack()}
          rightIcon="close"
          rightLabel="Close camera"
        />
      )}
      bottomActionsOverlay={false}
      bottomActions={(
        <BottomActions
          primaryButton={(
            <Button
              disabled={capturing}
              icon="circle"
              iconOnly
              iconSize={sizes.icon.xl}
              accessibilityLabel="Snap photo"
              loading={capturing}
              onPress={handleCapture}
            />
          )}
        />
      )}>
      <Image source={TEMP_SIMULATOR_CAMERA_IMAGE} style={styles.previewImage} />
      {alertText ? (
        <AlertModal
          onClose={() => setAlertText(null)}
          text={alertText}
          variant="error"
          visible
        />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    flex: 1,
    width: '100%',
  },
});
