# Bloom - Global State Management

Bloom is a React Native plant-care app: identify plants by photo, track owned plants and their
watering schedule, browse a plant wiki, and save favorites.

## Aspects Needing Global State

Three aspects of the app were identified as needing state shared across multiple, unrelated
screens rather than local `useState`:

| Aspect | Why it needs global state | Chosen for |
| --- | --- | --- |
| Resolved plant/species data (detections, owned plants, search history) | Read and written from `HomeScreen`, `LibraryScreen`, `WaterScreen`, `FavoritesScreen`, `SpeciesInfoScreen`, `AddPlantLoaderScreen`, `AddPlantPrefilledScreen`, and `PlantDetailScreen` — passing it down as props through the navigator would mean threading it through every intermediate screen | **Context API** |
| Favorites (which species the user has hearted) | Toggled from `SpeciesInfoScreen`, read by `MainTabBar` (to conditionally show the heart nav item) and `FavoritesScreen` (to render the list) — three screens with no parent/child relationship to each other | **Redux** |
| User session / auth state | `AuthStartScreen` exists as the app's entry screen; a real login would need session state readable app-wide (e.g. to gate navigation, show a logged-in email in Settings) | Identified, not yet implemented — this project has no real backend auth yet, so it's intentionally left out of scope for this assignment |

## Context API: `PlantDataProvider`

**Context + Provider** (`src/features/plants/data/PlantDataProvider.tsx`):

```tsx
const PlantDataContext = React.createContext<PlantDataContextValue | null>(null);

export function PlantDataProvider({ children, initialOwnedPlants = defaultInitialOwnedPlants }: PlantDataProviderProps) {
  const [ownedPlants, setOwnedPlants] = React.useState<OwnedPlant[]>(initialOwnedPlants);
  // ...detections, search history, and resolved-species caches also live here as state/refs

  const markWatered = React.useCallback((ownedPlantId: string) => {
    setOwnedPlants(current =>
      current.map(plant =>
        plant.ownedPlantId === ownedPlantId
          ? { ...plant, wateringHistory: [...plant.wateringHistory, new Date().toISOString()] }
          : plant,
      ),
    );
  }, []);

  // ...saveDetection, deleteOwnedPlant, renameOwnedPlant, resolveSpeciesById, etc.

  const value = React.useMemo<PlantDataContextValue>(() => ({ /* ...all state + functions */ }), [/* deps */]);

  return <PlantDataContext.Provider value={value}>{children}</PlantDataContext.Provider>;
}

export function usePlantData() {
  const value = React.useContext(PlantDataContext);
  if (!value) throw new Error('usePlantData must be used inside PlantDataProvider');
  return value;
}
```

**Root integration** (`src/navigation/RootNavigator.tsx`) — the provider wraps the entire app,
above the navigation container, nested inside the Redux `<Provider>` (aliased as `StoreProvider`
below, since both libraries call their wrapper `Provider`):

```tsx
<StoreProvider store={store}>
  <PlantDataProvider>
    <NavigationContainer>
      <Stack.Navigator>{/* ...all screens */}</Stack.Navigator>
    </NavigationContainer>
  </PlantDataProvider>
</StoreProvider>
```

**Interaction logic that changes context state** — e.g. `WaterScreen.tsx`, marking a plant watered
from a swipe/dismiss action:

```tsx
const { markWatered, ... } = usePlantData();
// ...
<WateringCard onDismiss={() => markWatered(ownedPlant.ownedPlantId)} ... />
```

**Applied to 2 components via `useContext`** — every consumer goes
through the `usePlantData()` hook, which is `React.useContext(PlantDataContext)` under the hood:

- `HomeScreen.tsx` — `const { getSpeciesById, ownedPlants } = usePlantData();` renders the owned-plant
  grid and reacts to `ownedPlants.length` to switch between empty/populated layouts.
- `WaterScreen.tsx` — `const { getSpeciesById, markWatered, ownedPlants } = usePlantData();` renders
  the due-for-watering list and dispatches `markWatered`/`unmarkWatered` from `WateringSlider`.
- `FavoritesScreen.tsx`, `SpeciesInfoScreen.tsx`, `AddPlantLoaderScreen.tsx`, `PlantDetailScreen.tsx`
  all also consume `usePlantData()` for species lookups, detection resolution, or saving a new plant.

## Redux: `favoritesSlice`

**Packages** — already installed (`package.json`): `@reduxjs/toolkit` and `react-redux`.

**Slice** (`src/store/favoritesSlice.ts`):

```ts
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [] as FavoritesState,
  reducers: {
    addFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      const alreadyPresent = state.some(item => item.speciesId === action.payload.speciesId);
      if (!alreadyPresent) state.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) =>
      state.filter(item => item.speciesId !== action.payload),
    // The "update" reducer: favorites are a membership list (no quantity field to change), so its
    // natural equivalent of an update is a state-dependent add-or-remove transition rather than a
    // plain push/filter — it reads current state and branches on it, same as changing a quantity
    // reads the current quantity and branches on it.
    toggleFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      const existingIndex = state.findIndex(item => item.speciesId === action.payload.speciesId);
      if (existingIndex === -1) {
        state.push(action.payload);
      } else {
        state.splice(existingIndex, 1);
      }
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
```

**Store** (`src/store/store.ts`) via `configureStore`, connected via `<Provider>` in
`RootNavigator.tsx` (`<StoreProvider store={store}>`, aliasing `Provider` from `react-redux`):

```ts
export const store = configureStore({
  reducer: { favorites: favoritesReducer },
});
```

**Screen integration** — `SpeciesInfoScreen.tsx` dispatches the update, keyed by the tapped
species' id passed through as data (the "props for dynamic data" requirement from Task 4):

```tsx
const dispatch = useAppDispatch();
const isFavorite = useAppSelector(state => state.favorites.some(favorite => favorite.speciesId === speciesIdParam));

const handleToggleFavorite = React.useCallback(() => {
  dispatch(toggleFavorite({
    addedAt: new Date().toISOString(),
    image: species.image,
    speciesId: species.speciesId,
    speciesName: species.speciesName,
  }));
}, [dispatch, isFavorite, species]);
```

`FavoritesScreen.tsx` reads and renders the list with `useSelector` (via the typed `useAppSelector`
wrapper in `src/store/hooks.ts`):

```tsx
const favorites = useAppSelector(state => state.favorites);
const favoritedSpecies = favorites
  .map(favorite => getSpeciesById(favorite.speciesId)) // cross-references Context data by id
  .filter((species): species is PlantSpecies => species != null);
```

`MainTabBar.tsx` also reads `useAppSelector(state => state.favorites.length)` to conditionally show
the heart nav item — a third, independent consumer of the same Redux state.

## Additional Requirements

| Requirement | Where it's satisfied |
| --- | --- |
| Modularity — context/slice in their own files | Context: `src/features/plants/data/PlantDataProvider.tsx`. Redux: `src/store/favoritesSlice.ts` (slice), `src/store/store.ts` (store setup), `src/store/hooks.ts` (typed `useAppSelector`/`useAppDispatch`) — none of this lives inside a screen or component file |
| Props — dynamic data passed where needed | `speciesId` flows as the dispatch payload key (`toggleFavorite({ speciesId, ... })`, `removeFavorite(speciesId)`); `ownedPlantId` is passed into `markWatered(ownedPlantId)`/`unmarkWatered(ownedPlantId)`; `PlantCard`'s `onPress` closes over the specific `species.speciesId` per rendered item |
| No magic numbers | Named constants throughout, e.g. `MAX_SEARCH_HISTORY`, `FIRST_MATCH_INDEX`, `INITIAL_OWNED_PLANT_INDEX` in `PlantDataProvider.tsx`; colors/spacing come from `src/theme` tokens, never inline hex/pixel values |
| Comments on non-obvious logic | e.g. `PlantDataProvider.tsx`'s in-flight/cache de-dup logic, `resolveSpeciesById`'s fallback-image isolation, and `favoritesSlice.ts`'s `toggleFavorite` comment above explain *why*, not just *what* |

## Demo

Favoriting a plant from its article (Redux `toggleFavorite`, dispatched with that plant's
`speciesId`) and then opening the Favorites list (Redux `useSelector` + Context `getSpeciesById`
resolving each favorite's full species data together):

![Context API + Redux demo — favoriting a plant and viewing the Favorites list](<docs/screenshots/bloom - favs.gif>)

