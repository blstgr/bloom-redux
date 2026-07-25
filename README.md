# Bloom API Integration

Bloom is a React Native plant-care app. This implementation connects the app to real plant-related REST APIs, stores API results in screen/provider state, renders searchable species results in a `FlatList`, handles API errors and longer loading flows, and opens a details screen from each selected result.

## API Selection

The app uses public REST APIs that match the plant-care theme:

| API | Purpose | Local wrapper |
| --- | --- | --- |
| Perenual | Search indoor species and fetch species care details | `src/services/plantApi.ts` |
| Pl@ntNet | Identify a plant from a captured image | `src/services/plantIdApi.ts` |
| Unsplash | Find a usable species photo when Perenual has no real image | `src/services/unsplashApi.ts` |
| DeepSeek | Generate short and long care copy from resolved plant facts | `src/services/plantCopyApi.ts` |

The primary list/search requirement is implemented with Perenual:

- `searchSpecies(name)` sends `GET /species-list?q=<name>&indoor=1`.
- `getSpeciesDetails(id)` sends `GET /species/details/{id}`.

API base URLs are centralized in `src/services/constants.ts`.

## Demo

**Add plant** — capture a photo, Pl@ntNet identifies the species, Perenual care facts resolve, and the plant is saved to the gallery.

![Add plant demo](<docs/screenshots/bloom - api - add plant.gif>)

**Detect plant** — identify a plant by photo from the Library tab and view its full species article, without adding it as an owned plant.

![Detect plant demo](<docs/screenshots/bloom - api - identify plant.gif>)

**Error handling** — the plant is identified by Pl@ntNet, but Perenual has no matching care-info entry for it; the app shows a graceful fallback instead of fabricating watering/toxicity facts.

![Error handling demo](<docs/screenshots/bloom - api - error.gif>)

## API Integration

Network logic is modularized under `src/services/` instead of being embedded directly in screens.

Example from `src/services/plantApi.ts`:

```ts
export async function searchSpecies(name: string): Promise<PerenualSpeciesListItem[]> {
  const query = encodeURIComponent(name);
  const payload = await fetchPerenual<PerenualSpeciesListResponse>(`/species-list?q=${query}&indoor=1`);
  return payload.data;
}
```

The app uses `fetch` for API calls. API keys are read from `@env` through `src/services/config.ts`; real values belong in local `.env`, which is gitignored. Use `.env.example` as the template:

```env
PERENUAL_API_KEY=
PLANTNET_API_KEY=
DEEPSEEK_API_KEY=
UNSPLASH_ACCESS_KEY=
```

State is handled with React state:

- `LibraryScreen.tsx` stores the typed query, search results, and search errors with `useState`.
- `PlantDataProvider.tsx` stores resolved species, detections, owned plants, and search history.

Comments in the service and screen files document why requests are filtered, debounced, ranked, and cached.

## Displaying Data In A List

The plant wiki search lives in `src/screens/LibraryScreen.tsx`.

Search results from Perenual are rendered with `FlatList` inside `SearchResultSection`:

```tsx
<FlatList
  data={items}
  keyExtractor={keyExtractor}
  renderItem={({ item }) => (
    <Pressable onPress={() => onSelect(item)} style={styles.resultRow}>
      <Icon color={colors.icon.primary} name="search" size="sm" />
      <AppText>{labelExtractor(item)}</AppText>
    </Pressable>
  )}
  scrollEnabled={false}
/>
```

The row uses existing app UI components (`Icon`, `AppText`) and the existing design-system styling. Each item has a stable key based on the API species id.

## Loading And Error Handling

`LibraryScreen.tsx` keeps the search suggestion area focused on results:

- Suggestions: matching species are rendered in the `FlatList` as soon as `searchSpecies()` returns.
- Error: network or API failures show a readable message: `Couldn't load search results. Check your connection and try again.`

Longer API flows use explicit loading UI:

- `PlantDataProvider.tsx` converts Perenual and Pl@ntNet rate limits into explicit `rate-limited` results.
- `AddPlantLoaderScreen.tsx` shows retry/retake messaging for failed photo identification.
- `SpeciesInfoScreen.tsx` shows a loader while details resolve and an error modal when details cannot be opened.

## Navigation Integration

The API-backed list is integrated into the existing Library tab.

When the user taps a Perenual result, `LibraryScreen.tsx` navigates to the details screen and passes the species id:

```tsx
rootNavigation?.navigate(SCREENS.SPECIES_INFO, {
  speciesId: String(item.id),
});
```

`SpeciesInfoScreen.tsx` reads `route.params.speciesId`, resolves the full species details through `resolveSpeciesById`, and renders the article/details once the data is available.

The camera search flow also connects to navigation:

- `AddPlantCameraScreen` captures or simulates a plant image.
- `AddPlantLoaderScreen` identifies and resolves the plant through the service layer.
- Add mode navigates to `AddPlantPrefilled`.
- Search mode navigates directly to `SpeciesInfo`.

## Additional Requirements

| Requirement | Implementation |
| --- | --- |
| Modularity | API requests live in `src/services/*Api.ts`; UI remains in `src/screens` and `src/components` |
| Documentation | Request, ranking, fallback, and caching logic has code comments where the behavior is non-trivial |
| Clean code | API URLs are constants in `src/services/constants.ts`; route names use `SCREENS`; API response types live in `src/services/types.ts` |
| Secret handling | Real keys stay in local `.env`; `.env.example` documents required variable names without exposing values |

## Running The Project

Install dependencies:

```sh
npm install
```

Create local environment variables:

```sh
cp .env.example .env
```

Fill `.env` with API keys, then start Metro:

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

Run verification:

```sh
npm run lint
npm test -- --runInBand
```
