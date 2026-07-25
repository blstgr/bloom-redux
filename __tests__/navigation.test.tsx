import React from 'react';
import { launchCamera } from 'react-native-image-picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReactTestRenderer from 'react-test-renderer';

import { Button } from '../src/components/ui/Button';
import { mockSpecies, type OwnedPlant } from '../src/features/plants/data/mockPlants';
import { PlantDataProvider } from '../src/features/plants/data/PlantDataProvider';
import {
  SCREENS,
  type AddPlantCameraScreenProps,
  type LibraryScreenProps,
  type PlantDetailScreenProps,
  type SpeciesInfoScreenProps,
} from '../src/navigation';
import { AddPlantCameraScreen } from '../src/screens/AddPlantCameraScreen';
import { LibraryScreen } from '../src/screens/LibraryScreen';
import { PlantDetailScreen } from '../src/screens/PlantDetailScreen';
import { SpeciesInfoScreen } from '../src/screens/SpeciesInfoScreen';
import { getSpeciesDetails, searchSpecies } from '../src/services/plantApi';
import { generateSpeciesCopy } from '../src/services/plantCopyApi';
import { searchPhoto } from '../src/services/unsplashApi';

jest.mock('react-native-image-picker');
jest.mock('../src/services/plantApi');
jest.mock('../src/services/plantCopyApi');
jest.mock('../src/services/unsplashApi');

const mockedLaunchCamera = jest.mocked(launchCamera);
const mockedSearchSpecies = jest.mocked(searchSpecies);
const mockedGetSpeciesDetails = jest.mocked(getSpeciesDetails);
const mockedGenerateSpeciesCopy = jest.mocked(generateSpeciesCopy);
const mockedSearchPhoto = jest.mocked(searchPhoto);
beforeEach(() => {
  jest.clearAllMocks();
  // LibraryScreen's search-as-you-type debounce can still fire after a test body returns (real
  // timers, not fake ones) — give it a safe default so a stray fire never calls .then() on
  // undefined from an unconfigured automock.
  mockedSearchSpecies.mockResolvedValue([]);
  mockedSearchPhoto.mockResolvedValue(null);
});

const TEST_OWNED_PLANT: OwnedPlant = {
  addedAt: '2026-07-01T00:00:00.000Z',
  customName: 'Desk ZZ',
  image: mockSpecies[0].image,
  ownedPlantId: 'owned-plant-test',
  speciesId: mockSpecies[0].speciesId,
  wateringHistory: [],
};
const TEST_SAFE_AREA_METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
};

function createPlantDetailProps(
  ownedPlantId?: string,
  goBack = jest.fn(),
  replace = jest.fn(),
  canGoBack = true,
): PlantDetailScreenProps {
  return {
    navigation: {
      canGoBack: () => canGoBack,
      getParent: () => undefined,
      goBack,
      replace,
    },
    route: {
      key: SCREENS.PLANT_DETAIL,
      name: SCREENS.PLANT_DETAIL,
      params: ownedPlantId ? { ownedPlantId } : undefined,
    },
  } as unknown as PlantDetailScreenProps;
}

function createLibraryProps(
  rootNavigate = jest.fn(),
  tabNavigate = jest.fn(),
  openDrawer = jest.fn(),
): LibraryScreenProps {
  return {
    navigation: {
      getParent: () => ({
        getParent: () => ({
          navigate: rootNavigate,
        }),
        openDrawer,
      }),
      navigate: tabNavigate,
    },
    route: {
      key: SCREENS.LIBRARY,
      name: SCREENS.LIBRARY,
    },
  } as unknown as LibraryScreenProps;
}

function createSpeciesInfoProps(
  speciesId?: string,
  goBack = jest.fn(),
  replace = jest.fn(),
  canGoBack = true,
): SpeciesInfoScreenProps {
  return {
    navigation: {
      canGoBack: () => canGoBack,
      goBack,
      replace,
    },
    route: {
      key: SCREENS.SPECIES_INFO,
      name: SCREENS.SPECIES_INFO,
      params: speciesId ? { speciesId } : undefined,
    },
  } as unknown as SpeciesInfoScreenProps;
}

function createAddPlantCameraProps(
  navigate = jest.fn(),
): AddPlantCameraScreenProps {
  return {
    navigation: {
      getParent: () => ({
        goBack: jest.fn(),
      }),
      navigate,
    },
    route: {
      key: SCREENS.ADD_PLANT_CAMERA,
      name: SCREENS.ADD_PLANT_CAMERA,
      params: undefined,
    },
  } as unknown as AddPlantCameraScreenProps;
}

function renderWithProviders(
  children: React.ReactNode,
  initialOwnedPlants: OwnedPlant[] = [],
) {
  return (
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <PlantDataProvider initialOwnedPlants={initialOwnedPlants}>
        {children}
      </PlantDataProvider>
    </SafeAreaProvider>
  );
}

test('renders plant detail for a valid owned plant id', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(
        <PlantDetailScreen {...createPlantDetailProps(TEST_OWNED_PLANT.ownedPlantId)} />,
        [TEST_OWNED_PLANT],
      ),
    );
  });

  expect(
    renderer?.root.findAllByProps({ value: TEST_OWNED_PLANT.customName }).length,
  ).toBeGreaterThan(0);
});

test('deletes a plant from the detail screen and returns', async () => {
  const goBack = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(
        <PlantDetailScreen
          {...createPlantDetailProps(TEST_OWNED_PLANT.ownedPlantId, goBack)}
        />,
        [TEST_OWNED_PLANT],
      ),
    );
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByProps({ accessibilityLabel: 'Delete plant' }).props.onPress();
  });

  expect(goBack).toHaveBeenCalledTimes(1);
});

test('renders an error modal when owned plant id is missing', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<PlantDetailScreen {...createPlantDetailProps()} />),
    );
  });

  expect(
    renderer?.root.findByProps({
      children: 'Plant details could not be opened because no saved plant was selected.',
    }),
  ).toBeTruthy();
});

test('missing plant detail can close to home when there is no back route', async () => {
  const replace = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<PlantDetailScreen {...createPlantDetailProps(undefined, jest.fn(), replace, false)} />),
    );
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByType(Button).props.onPress();
  });

  expect(replace).toHaveBeenCalledWith(SCREENS.SETTINGS_DRAWER, {
    params: { screen: SCREENS.HOME },
    screen: SCREENS.MAIN_TABS,
  });
});

test('renders library search and keeps plant wiki tab selected', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<LibraryScreen {...createLibraryProps()} />),
    );
  });

  expect(renderer?.root.findByProps({ accessibilityLabel: 'Search plant wiki' })).toBeTruthy();
  expect(
    renderer?.root
      .findAllByProps({ accessibilityLabel: 'plant wiki' })
      .some(node => node.props.accessibilityState?.selected === true),
  ).toBe(true);
});

test('navigates from library search result to species info with species id', async () => {
  const rootNavigate = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  mockedSearchSpecies.mockResolvedValueOnce([
    {
      common_name: 'Zebra Haworthia',
      default_image: null,
      id: 501,
      scientific_name: ['Haworthiopsis attenuata'],
    },
  ]);
  mockedGetSpeciesDetails.mockResolvedValueOnce({
    care_level: 'Easy',
    common_name: 'Zebra Haworthia',
    default_image: null,
    dimensions: null,
    growth_rate: 'Low',
    id: 501,
    poisonous_to_humans: false,
    poisonous_to_pets: false,
    scientific_name: ['Haworthiopsis attenuata'],
    sunlight: null,
    watering_general_benchmark: { unit: 'days', value: '14' },
  });
  mockedGenerateSpeciesCopy.mockResolvedValueOnce({
    category: 'Desert minimalist',
    description: 'Only needs water when fully dry.',
    wikiArticle: 'A longer article.',
  });

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<LibraryScreen {...createLibraryProps(rootNavigate)} />),
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root.findByProps({ accessibilityLabel: 'Search plant wiki' }).props.onChangeText('Zebra Haworthia');
    // Flushes LibraryScreen's immediate mocked search promise chain.
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByProps({ accessibilityLabel: 'Open Zebra Haworthia' }).props.onPress();
  });

  // Flushes the tap handler's own getSpeciesDetails -> generateSpeciesCopy promise chain.
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(rootNavigate).toHaveBeenCalledWith(SCREENS.SPECIES_INFO, {
    speciesId: '501',
  });
});

test('library search replaces camera action with clear action while typing', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<LibraryScreen {...createLibraryProps()} />),
    );
  });

  expect(renderer?.root.findByProps({ accessibilityLabel: 'Search plant by photo' })).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer?.root.findByProps({ accessibilityLabel: 'Search plant wiki' }).props.onChangeText('Z');
  });

  expect(renderer?.root.findAllByProps({ accessibilityLabel: 'Search plant by photo' })).toHaveLength(0);
  expect(renderer?.root.findByProps({ accessibilityLabel: 'Clear plant search' })).toBeTruthy();

  // Unmount before the test ends so the pending search-debounce timeout this typing started
  // (never awaited above, since this test only checks synchronous UI state) is cancelled by the
  // effect cleanup, rather than firing later against a torn-down Jest environment.
  ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});

test('library camera search launches the camera flow', async () => {
  const rootNavigate = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<LibraryScreen {...createLibraryProps(rootNavigate)} />),
    );
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByProps({ accessibilityLabel: 'Search plant by photo' }).props.onPress();
  });

  expect(rootNavigate).toHaveBeenCalledWith(SCREENS.ADD_PLANT_STACK, {
    screen: SCREENS.ADD_PLANT_CAMERA,
    params: { mode: 'search' },
  });
});

test('renders an error modal when species id is missing', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<SpeciesInfoScreen {...createSpeciesInfoProps()} />),
    );
  });

  expect(
    renderer?.root.findByProps({
      children: 'Plant info could not be opened because no species was selected.',
    }),
  ).toBeTruthy();
});

test('missing species info can close to home when there is no back route', async () => {
  const replace = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<SpeciesInfoScreen {...createSpeciesInfoProps(undefined, jest.fn(), replace, false)} />),
    );
  });

  await ReactTestRenderer.act(() => {
    renderer?.root.findByType(Button).props.onPress();
  });

  expect(replace).toHaveBeenCalledWith(SCREENS.SETTINGS_DRAWER, {
    params: { screen: SCREENS.HOME },
    screen: SCREENS.MAIN_TABS,
  });
});

test('camera flow uses native camera capture when a device photo is available', async () => {
  const navigate = jest.fn();
  mockedLaunchCamera.mockResolvedValueOnce({
    assets: [{ uri: 'file:///captured-plant.jpg' }],
  });
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<AddPlantCameraScreen {...createAddPlantCameraProps(navigate)} />),
    );
  });

  await ReactTestRenderer.act(async () => {
    await renderer?.root
      .findByProps({ accessibilityLabel: 'Snap photo' })
      .props.onPress();
  });

  expect(mockedLaunchCamera).toHaveBeenCalledWith({
    cameraType: 'back',
    mediaType: 'photo',
    quality: 0.8,
    saveToPhotos: false,
  });
  expect(navigate).toHaveBeenCalledWith(SCREENS.ADD_PLANT_LOADER, {
    captureId: 'detection-1',
    mode: undefined,
  });
});

test('camera flow uses the simulator fallback only when native camera is unavailable', async () => {
  const navigate = jest.fn();
  mockedLaunchCamera.mockRejectedValueOnce(new Error('camera unavailable'));
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      renderWithProviders(<AddPlantCameraScreen {...createAddPlantCameraProps(navigate)} />),
    );
  });

  await ReactTestRenderer.act(async () => {
    await renderer?.root
      .findByProps({ accessibilityLabel: 'Snap photo' })
      .props.onPress();
  });

  expect(mockedLaunchCamera).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith(SCREENS.ADD_PLANT_LOADER, {
    captureId: 'detection-1',
    mode: undefined,
  });
});
