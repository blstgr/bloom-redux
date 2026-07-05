# Bloom — Navigation

Bloom is a React Native plant-care app. This assignment implements the navigation structure from the Figma design using Stack, Tab, and Drawer navigation, with typed route parameters, custom navigation UI, error handling, and iOS/Android verification.

## Demo

Navigation demo:

![Bloom navigation demo](docs/screenshots/nav-demo.gif)

## Navigation Structure Design

The app uses three navigation types:

| Navigation type | Where it is used | Purpose |
| --- | --- | --- |
| `Stack.Navigator` | `RootNavigator`, `AddPlantStackNavigator` | Linear flows and detail screens: auth, add-plant flow, plant detail, species info |
| `Tab.Navigator` | `TabNavigator` | Fast access between main app sections: Home, Library, Water |
| `Drawer.Navigator` | `SettingsDrawerNavigator` | Additional app functions/settings opened from the top-right more button or drawer gesture |

Main screen connections:

| From | Action | To |
| --- | --- | --- |
| `AuthStart` | Continue / create account | `SettingsDrawer -> MainTabs -> Home` |
| `Home` | Bottom add button | `AddPlantStack -> AddPlantCamera` |
| `Home` | Plant card | `PlantDetail` |
| `Home`, `Library`, `Water` | Bottom tabs | Switch between `Home`, `Library`, `Water` |
| `Home`, `Library`, `Water` | More button | Open settings drawer |
| `Library` | Search result | `SpeciesInfo` |
| `Library` | Camera search | `AddPlantStack -> AddPlantCamera` in search mode |
| `Water` | Watering card | `PlantDetail` |
| `AddPlantCamera` | Capture photo | `AddPlantLoader` |
| `AddPlantLoader` | Recognition completed | `AddPlantPrefilled` or `SpeciesInfo` |
| `AddPlantPrefilled` | Save plant | `PlantDetail` |

Route parameters:

| Route | Params | Why |
| --- | --- | --- |
| `AddPlantCamera` | `{ mode?: 'add' \| 'search' }` | Opens camera either for saving an owned plant or searching the plant wiki |
| `AddPlantLoader` | `{ captureId?: string; mode?: 'add' \| 'search' }` | Loads the captured plant detection |
| `AddPlantPrefilled` | `{ detectionId?: string }` | Displays recognized plant data before saving |
| `PlantDetail` | `{ ownedPlantId?: string }` | Shows dynamic content for a saved plant |
| `SpeciesInfo` | `{ speciesId?: string }` | Shows dynamic content for a plant wiki/species result |

All route names are centralized in `SCREENS` (`src/navigation/constants.ts`), and all route params are typed in `src/navigation/types.ts`.

## Navigation Implementation

Navigation is split into separate files:

```text
src/navigation/
├── AddPlantStackNavigator.tsx
├── MainTabBar.tsx
├── RootNavigator.tsx
├── SettingsDrawerNavigator.tsx
├── TabNavigator.tsx
├── constants.ts
├── index.ts
└── types.ts
```

Implemented containers:

- `RootNavigator.tsx`: wraps the app in `NavigationContainer` and defines the root native stack.
- `TabNavigator.tsx`: defines Home, Library, and Water tabs. The default tab bar is hidden and replaced with the custom `MainTabBar`.
- `AddPlantStackNavigator.tsx`: defines the camera -> loader -> prefilled save flow.
- `SettingsDrawerNavigator.tsx`: wraps the main tabs in a right-side drawer and renders `SettingsPanel` as custom drawer content.

Custom components integrated into screens:

- `TopActions` for close, back, trash, and more buttons.
- `MainTabBar` / `NavBar` for the glass bottom navigation.
- `PlantCard` for plant navigation from Home.
- `WateringCard` for navigation from Water.
- `Input` for Library search and camera search.
- `AlertModal` for missing/invalid route params.

Native headers are intentionally disabled with `headerShown: false`; the app uses custom glassmorphic headers and buttons from the design system instead of default OS headers.

## Passing Data Between Screens

The app passes IDs through `navigation.navigate()` / `navigation.replace()` and reads them with `route.params`.

Examples from the implementation:

```tsx
rootNavigation?.navigate(SCREENS.PLANT_DETAIL, {
  ownedPlantId: plant.ownedPlantId,
});
```

```tsx
const ownedPlant = getOwnedPlantById(route.params?.ownedPlantId);
```

```tsx
rootNavigation?.navigate(SCREENS.SPECIES_INFO, {
  speciesId: item.speciesId,
});
```

```tsx
const species = getSpeciesById(route.params?.speciesId);
```

Missing params are handled safely:

- Missing `ownedPlantId` in `PlantDetailScreen` shows an error modal.
- Missing `speciesId` in `SpeciesInfoScreen` shows an error modal.
- Missing `captureId` in `AddPlantLoaderScreen` shows an error modal.
- Missing `detectionId` in `AddPlantPrefilledScreen` shows an error modal.

If there is no back route, the error modal returns the user to `Home`.

## Navigation Element Styling

Navigation styling is matched to the Figma design:

- Native headers are hidden globally.
- `TopActions` provides custom circular glass buttons for back/close/more/trash actions.
- `MainTabBar` uses custom icons, active state, and a watering badge.
- The center add button is an action, not a selected tab, so it stays visually inactive.
- Drawer content uses the existing `SettingsPanel`, not the default drawer menu list.
- Theme values are centralized in `src/theme` for colors, spacing, typography, radii, and sizes.

The drawer needs a small implementation note in code because the design shows settings as a custom panel, while the assignment requires Drawer navigation. This is documented in `SettingsDrawerNavigator.tsx`.

## Adaptivity And Testing

Verification completed:

- iOS app was run and visually checked.
- Android app was run and visually checked.
- Drawer gesture works through `GestureHandlerRootView`.
- Navigation params and missing-param error paths are covered by tests.

Automated checks:

```sh
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Current test coverage includes:

- `PlantDetail` renders with a valid `ownedPlantId`.
- Missing `ownedPlantId` shows an error and can return to Home.
- `Library` search result navigates to `SpeciesInfo` with `speciesId`.
- Missing `speciesId` shows an error and can return to Home.
- Camera capture navigates to `AddPlantLoader` with `captureId`.
- Main tab active state and add-action inactive state are tested.
- Cross-platform component rendering is checked for iOS and Android.

## Additional Requirements

| Requirement | Implementation |
| --- | --- |
| Modularity | Navigators are separated under `src/navigation/`; screens are under `src/screens/` |
| Documentation/comments | Complex drawer behavior is commented in `SettingsDrawerNavigator.tsx` |
| Clean code | Route constants use `SCREENS`; params are typed; navigation exports go through the navigation barrel |
| Custom components | Screens use custom buttons, cards, inputs, top actions, bottom actions, and modals |
| Error handling | Missing route params render `AlertModal` instead of crashing |

## Running The Project

Install dependencies:

```sh
npm install
```

Start Metro:

```sh
npm run start
```

Run iOS:

```sh
npm run ios
```

Run Android:

```sh
npm run android
```

Run tests:

```sh
npm test -- --runInBand
```
