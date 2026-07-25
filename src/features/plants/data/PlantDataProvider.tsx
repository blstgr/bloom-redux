import React from 'react';
import type { ImageSourcePropType } from 'react-native';

import { resolveCareFacts } from '../../../services/careDerivation';
import { PERENUAL_UPGRADE_PLACEHOLDER_MARKER } from '../../../services/constants';
import { getSpeciesDetails, PlantApiError, searchSpecies } from '../../../services/plantApi';
import { generateSpeciesCopy } from '../../../services/plantCopyApi';
import { identifyPlant, PlantIdApiError, resolveIdentification } from '../../../services/plantIdApi';
import type {
  GeneratedSpeciesCopy,
  PerenualSpeciesDetails,
  PerenualSpeciesListItem,
  ResolvedCareFacts,
} from '../../../services/types';
import { searchPhoto } from '../../../services/unsplashApi';

import {
  getSpeciesById as getMockSpeciesById,
  initialOwnedPlants as defaultInitialOwnedPlants,
  type OwnedPlant,
  type PlantDetection,
  type PlantSpecies,
} from './mockPlants';

const noPlantPhoto = require('../../../assets/images/no-plant-photo.jpg') as ImageSourcePropType;

type PlantNameSaveResult =
  | {
      duplicate: false;
      ownedPlantId: string;
    }
  | {
      duplicate: true;
      message: string;
    };

export type SpeciesLookupFailureReason =
  | 'low-confidence'
  | 'network-error'
  | 'no-candidates'
  | 'no-perenual-match'
  | 'rate-limited';

export type SpeciesLookupResult =
  | { reason: SpeciesLookupFailureReason; success: false }
  | { species: PlantSpecies; success: true };

export type PlantDataContextValue = {
  addSearchHistoryEntry: (species: PlantSpecies) => void;
  createDetection: (image: PlantDetection['image']) => PlantDetection;
  deleteOwnedPlant: (ownedPlantId: string) => void;
  detections: PlantDetection[];
  getDetectionById: (detectionId: string | undefined) => PlantDetection | undefined;
  getOwnedPlantById: (ownedPlantId: string | undefined) => OwnedPlant | undefined;
  getSpeciesById: (speciesId: string | undefined) => PlantSpecies | undefined;
  /** Shared by AddPlantLoaderScreen and LibraryScreen's photo search so the two flows can never
   * disagree on what counts as a confident identification. */
  identifyAndResolveSpecies: (image: ImageSourcePropType) => Promise<SpeciesLookupResult>;
  /** Used internally by identifyAndResolveSpecies to turn an accepted Pl@ntNet name into a
   * Perenual match. Exposed for cases with only a name and no exact Perenual id in hand.
   * `fallbackImage`, when given, is preferred over the generic no-photo asset if no real photo
   * is found for the resolved species. */
  lookupSpeciesByName: (name: string, fallbackImage?: ImageSourcePropType) => Promise<SpeciesLookupResult>;
  markWatered: (ownedPlantId: string) => void;
  ownedPlants: OwnedPlant[];
  /** Species name to prefill into the Library search box after a "search by photo" capture. */
  pendingLibrarySearch: string | null;
  renameOwnedPlant: (ownedPlantId: string, customName: string) => PlantNameSaveResult;
  /** Attaches a resolved species (and the generated name that depends on it) to a detection that
   * was created before identification/lookup completed. */
  resolveDetectionSpecies: (detectionId: string, species: PlantSpecies) => void;
  /** Resolves a specific, already-known Perenual species id (cache-checked) — used by LibraryScreen
   * for an exact typed-search result, and by SpeciesInfoScreen to resolve in place when navigated
   * to before resolution has completed (optimistic navigation). */
  resolveSpeciesById: (perenualId: number, fallbackImage?: ImageSourcePropType) => Promise<SpeciesLookupResult>;
  saveDetection: (detectionId: string, customName: string) => PlantNameSaveResult;
  /** Most-recently-opened species from Library search, newest first. */
  searchHistory: PlantSpecies[];
  setPendingLibrarySearch: (speciesName: string | null) => void;
  unmarkWatered: (ownedPlantId: string) => void;
};

const INITIAL_DETECTION_INDEX = 1;
const INITIAL_OWNED_PLANT_INDEX = 1;
const FIRST_DUPLICATE_SUFFIX = 2;
const MAX_SEARCH_HISTORY = 3;
const FIRST_MATCH_INDEX = 0;
const PlantDataContext = React.createContext<PlantDataContextValue | null>(null);

type PlantDataProviderProps = {
  children: React.ReactNode;
  initialOwnedPlants?: OwnedPlant[];
};

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export function findDuplicateName(name: string, ownedPlants: OwnedPlant[], excludeOwnedPlantId?: string) {
  const normalized = normalizeName(name);
  return ownedPlants.some(
    plant => plant.ownedPlantId !== excludeOwnedPlantId && normalizeName(plant.customName) === normalized,
  );
}

export function buildDuplicateNameMessage(name: string) {
  return `You already have a ${name}. Save this one under a different name or discard`;
}

function buildGeneratedName(speciesName: string, ownedPlants: OwnedPlant[]) {
  const existingNames = new Set(ownedPlants.map(plant => normalizeName(plant.customName)));
  if (!existingNames.has(normalizeName(speciesName))) return speciesName;

  let suffix = FIRST_DUPLICATE_SUFFIX;
  while (existingNames.has(normalizeName(`${speciesName} ${suffix}`))) {
    suffix += 1;
  }

  return `${speciesName} ${suffix}`;
}

function getNextOwnedPlantIndex(ownedPlants: OwnedPlant[]) {
  return ownedPlants.reduce((nextIndex, plant) => {
    const match = /^owned-plant-(\d+)$/.exec(plant.ownedPlantId);
    if (!match) return nextIndex;

    return Math.max(nextIndex, Number(match[1]) + 1);
  }, INITIAL_OWNED_PLANT_INDEX);
}

const SCIENTIFIC_NAME_INDEX = 0;
const GENUS_TOKEN_INDEX = 0;
const SPECIES_EPITHET_TOKEN_INDEX = 1;
const MIN_STRIPPABLE_WORD_COUNT = 2;
const NO_PHOTO_ACKNOWLEDGMENT = "We couldn't reliably find what this one looks like, but here's what we know:\n\n";

/** A real photo, never Perenual's own "upgrade to see this image" upsell graphic. */
function getRealPerenualImageUrl(details: PerenualSpeciesDetails): string | null {
  const url = details.default_image?.original_url ?? details.default_image?.medium_url ?? null;
  if (!url || url.includes(PERENUAL_UPGRADE_PLACEHOLDER_MARKER)) return null;
  return url;
}

/** "Acer palmatum 'Gwen's Rose Delight'" -> "Acer palmatum" — genus + species epithet, dropping
 * any cultivar/variety suffix, which is usually much better indexed by a photo search. */
function parseGenusAndSpeciesEpithet(scientificName: string[]): string | null {
  const first = scientificName[SCIENTIFIC_NAME_INDEX];
  if (!first) return null;

  const words = first.trim().split(/\s+/);
  const genus = words[GENUS_TOKEN_INDEX];
  const speciesEpithet = words[SPECIES_EPITHET_TOKEN_INDEX];
  if (!genus || !speciesEpithet) return null;

  return `${genus} ${speciesEpithet}`;
}

/** "Shirazz Japanese Maple" -> "Japanese Maple" — drops a leading cultivar-style modifier so a
 * generic version of the plant can still be found even when the exact cultivar can't. */
function stripLeadingWord(name: string): string | null {
  const words = name.trim().split(/\s+/);
  if (words.length < MIN_STRIPPABLE_WORD_COUNT) return null;

  return words.slice(1).join(' ');
}

/**
 * Tiered photo search, most to least specific: a real (non-placeholder) Perenual photo, an exact
 * Unsplash match on the common name, the scientific name, then a genus-level common-name fallback.
 * Returns null (not an error) when nothing usable was found at any tier — callers fall back to
 * either the user's own captured photo (if this came from a photo-identify flow) or a generic
 * "no photo available" asset.
 */
async function findSpeciesPhotoUrl(details: PerenualSpeciesDetails): Promise<string | null> {
  const realPerenualUrl = getRealPerenualImageUrl(details);
  if (realPerenualUrl) return realPerenualUrl;

  const exactMatch = await searchPhoto(details.common_name);
  if (exactMatch) return exactMatch;

  const scientificQuery = parseGenusAndSpeciesEpithet(details.scientific_name);
  const scientificMatch = scientificQuery ? await searchPhoto(scientificQuery) : null;
  if (scientificMatch) return scientificMatch;

  const genericQuery = stripLeadingWord(details.common_name);
  return genericQuery ? searchPhoto(genericQuery) : null;
}

type ResolvedSpeciesCore = {
  commonName: string;
  generated: GeneratedSpeciesCopy;
  photoUrl: string | null;
  resolvedFacts: ResolvedCareFacts;
};

/** The part of species resolution that's identical no matter who asks for it — safe to share
 * across concurrent callers (cache/in-flight dedup) because it never depends on a caller-specific
 * fallback image. Perenual details, derived care facts, the tiered photo search, and the
 * generated copy all live here. */
async function resolveSpeciesCore(perenualId: number): Promise<ResolvedSpeciesCore> {
  const details = await getSpeciesDetails(perenualId);
  const resolvedFacts = resolveCareFacts(details);
  // Run independently rather than sequentially — copy generation never needed the photo result,
  // it only used to (needlessly) wait on it. This is what lets the slower of the two (usually
  // DeepSeek) set the total wait instead of the sum of both.
  const [photoUrl, generated] = await Promise.all([
    findSpeciesPhotoUrl(details),
    generateSpeciesCopy(resolvedFacts, details),
  ]);

  return { commonName: details.common_name, generated, photoUrl, resolvedFacts };
}

/** The caller-specific part: cheap, synchronous, never shared. `fallbackImage` (the user's own
 * captured photo, when resolution started from a photo-identify flow) is preferred over the
 * generic no-photo asset if every real photo tier came up empty in the core resolution above —
 * applied fresh per caller so one caller's fallback image can never leak into another concurrent
 * caller's result for the same species. */
function assemblePlantSpecies(
  perenualId: number,
  core: ResolvedSpeciesCore,
  fallbackImage?: ImageSourcePropType,
): PlantSpecies {
  const { commonName, generated, photoUrl, resolvedFacts } = core;
  const speciesId = String(perenualId);
  const imageSource: ImageSourcePropType = photoUrl ? { uri: photoUrl } : (fallbackImage ?? noPlantPhoto);
  const hasPhoto = photoUrl !== null || fallbackImage !== undefined;

  return {
    category: generated.category,
    description: hasPhoto ? generated.description : `${NO_PHOTO_ACKNOWLEDGMENT}${generated.description}`,
    detailImage: imageSource,
    detailImageUrl: photoUrl ?? '',
    image: imageSource,
    speciesId,
    speciesName: commonName,
    wateringIntervalDays: resolvedFacts.wateringIntervalDays,
    wikiArticle: hasPhoto ? generated.wikiArticle : `${NO_PHOTO_ACKNOWLEDGMENT}${generated.wikiArticle}`,
  };
}

export function PlantDataProvider({
  children,
  initialOwnedPlants = defaultInitialOwnedPlants,
}: PlantDataProviderProps) {
  const [ownedPlants, setOwnedPlants] = React.useState<OwnedPlant[]>(initialOwnedPlants);
  const [detections, setDetections] = React.useState<PlantDetection[]>([]);
  const [pendingLibrarySearch, setPendingLibrarySearch] = React.useState<string | null>(null);
  const [searchHistory, setSearchHistory] = React.useState<PlantSpecies[]>([]);
  const [speciesCacheVersion, setSpeciesCacheVersion] = React.useState(0);
  const ownedPlantsRef = React.useRef<OwnedPlant[]>(initialOwnedPlants);
  const detectionIndexRef = React.useRef(INITIAL_DETECTION_INDEX);
  const ownedPlantIndexRef = React.useRef(getNextOwnedPlantIndex(initialOwnedPlants));
  const speciesCacheRef = React.useRef<Record<string, PlantSpecies>>({});
  const speciesCoreCacheRef = React.useRef<Record<string, ResolvedSpeciesCore>>({});
  const speciesCoreInFlightRef = React.useRef<Record<string, Promise<ResolvedSpeciesCore>>>({});

  const createDetection = React.useCallback((image: PlantDetection['image']) => {
    const detection: PlantDetection = {
      detectionId: `detection-${detectionIndexRef.current}`,
      image,
    };

    detectionIndexRef.current += 1;
    setDetections(current => [...current, detection]);
    return detection;
  }, []);

  const resolveDetectionSpecies = React.useCallback((detectionId: string, species: PlantSpecies) => {
    setDetections(current =>
      current.map(detection =>
        detection.detectionId === detectionId
          ? {
              ...detection,
              generatedName: buildGeneratedName(species.speciesName, ownedPlantsRef.current),
              speciesId: species.speciesId,
            }
          : detection,
      ),
    );
  }, []);

  const getDetectionByIdFromState = React.useCallback(
    (detectionId: string | undefined) =>
      detections.find(detection => detection.detectionId === detectionId),
    [detections],
  );

  const getSpeciesById = React.useCallback(
    (speciesId: string | undefined) => {
      if (!speciesId) return undefined;
      return speciesCacheRef.current[speciesId] ?? getMockSpeciesById(speciesId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speciesCacheVersion drives re-reads of the ref
    [speciesCacheVersion],
  );

  const resolveSpeciesById = React.useCallback(
    async (perenualId: number, fallbackImage?: ImageSourcePropType): Promise<SpeciesLookupResult> => {
      const speciesId = String(perenualId);

      // Only the shared "core" (Perenual/Unsplash/DeepSeek work, identical for every caller) is
      // cached/de-duped here — never the final assembled species. Baking a caller's fallbackImage
      // into a shared cache/in-flight entry would let whichever caller resolves first decide the
      // image (and hasPhoto-dependent description) for every other concurrent caller too.
      let core = speciesCoreCacheRef.current[speciesId];
      if (!core) {
        let inFlight = speciesCoreInFlightRef.current[speciesId];
        if (!inFlight) {
          inFlight = resolveSpeciesCore(perenualId);
          speciesCoreInFlightRef.current[speciesId] = inFlight;
        }

        try {
          core = await inFlight;
        } catch (error) {
          console.error('resolveSpeciesById failed', error);
          if (error instanceof PlantApiError && error.kind === 'rate-limited') {
            return { reason: 'rate-limited', success: false };
          }
          return { reason: 'network-error', success: false };
        } finally {
          delete speciesCoreInFlightRef.current[speciesId];
        }

        speciesCoreCacheRef.current[speciesId] = core;
      }

      const species = assemblePlantSpecies(perenualId, core, fallbackImage);

      // The persisted, synchronously-readable cache (getSpeciesById — search history, future
      // lookups) always stores the canonical no-fallback-image assembly, regardless of which
      // caller resolved it first, so a photo-add flow's own captured photo never becomes another
      // unrelated lookup's species image.
      if (!speciesCacheRef.current[speciesId]) {
        const canonicalSpecies = fallbackImage ? assemblePlantSpecies(perenualId, core, undefined) : species;
        speciesCacheRef.current = { ...speciesCacheRef.current, [speciesId]: canonicalSpecies };
        setSpeciesCacheVersion(version => version + 1);
      }

      return { species, success: true };
    },
    [],
  );

  const lookupSpeciesByName = React.useCallback(
    async (name: string, fallbackImage?: ImageSourcePropType): Promise<SpeciesLookupResult> => {
      let results: PerenualSpeciesListItem[];
      try {
        results = await searchSpecies(name);
      } catch (error) {
        console.error('lookupSpeciesByName: searchSpecies failed', error);
        if (error instanceof PlantApiError && error.kind === 'rate-limited') {
          return { reason: 'rate-limited', success: false };
        }
        return { reason: 'network-error', success: false };
      }

      const match = results[FIRST_MATCH_INDEX];
      if (!match) return { reason: 'no-perenual-match', success: false };

      return resolveSpeciesById(match.id, fallbackImage);
    },
    [resolveSpeciesById],
  );

  const identifyAndResolveSpecies = React.useCallback(
    async (image: ImageSourcePropType): Promise<SpeciesLookupResult> => {
      let candidates;
      try {
        candidates = await identifyPlant(image);
      } catch (error) {
        console.error('identifyAndResolveSpecies: identifyPlant failed', error);
        if (error instanceof PlantIdApiError && error.kind === 'quota-exceeded') {
          return { reason: 'rate-limited', success: false };
        }
        return { reason: 'network-error', success: false };
      }

      const identification = resolveIdentification(candidates);
      if (!identification.accepted) {
        return { reason: identification.reason, success: false };
      }

      const { species: candidateSpecies } = identification.candidate;
      const name = candidateSpecies.commonNames[FIRST_MATCH_INDEX] ?? candidateSpecies.scientificNameWithoutAuthor;
      return lookupSpeciesByName(name, image);
    },
    [lookupSpeciesByName],
  );

  const getOwnedPlantById = React.useCallback(
    (ownedPlantId: string | undefined) =>
      ownedPlants.find(plant => plant.ownedPlantId === ownedPlantId),
    [ownedPlants],
  );

  const deleteOwnedPlant = React.useCallback((ownedPlantId: string) => {
    setOwnedPlants(current => {
      const nextPlants = current.filter(plant => plant.ownedPlantId !== ownedPlantId);
      ownedPlantsRef.current = nextPlants;
      return nextPlants;
    });
  }, []);

  const saveDetection = React.useCallback(
    (detectionId: string, customName: string): PlantNameSaveResult => {
      const detection = detections.find(item => item.detectionId === detectionId);
      const species = getSpeciesById(detection?.speciesId);
      const nextName = customName.trim();

      if (!detection || !species || nextName.length === 0) {
        return {
          duplicate: true,
          message: 'Plant could not be saved. Try taking another photo.',
        };
      }

      const currentPlants = ownedPlantsRef.current;

      if (findDuplicateName(nextName, currentPlants)) {
        return {
          duplicate: true,
          message: buildDuplicateNameMessage(nextName),
        };
      }

      const ownedPlantId = `owned-plant-${ownedPlantIndexRef.current}`;
      ownedPlantIndexRef.current += 1;
      const nextPlants = [
        ...currentPlants,
        {
          addedAt: new Date().toISOString(),
          customName: nextName,
          image: detection.image,
          ownedPlantId,
          speciesId: species.speciesId,
          wateringHistory: [],
        },
      ];
      ownedPlantsRef.current = nextPlants;
      setOwnedPlants(nextPlants);

      return {
        duplicate: false,
        ownedPlantId,
      };
    },
    [detections, getSpeciesById],
  );

  const markWatered = React.useCallback((ownedPlantId: string) => {
    setOwnedPlants(current => {
      const nextPlants = current.map(plant =>
        plant.ownedPlantId === ownedPlantId
          ? { ...plant, wateringHistory: [...plant.wateringHistory, new Date().toISOString()] }
          : plant,
      );
      ownedPlantsRef.current = nextPlants;
      return nextPlants;
    });
  }, []);

  const unmarkWatered = React.useCallback((ownedPlantId: string) => {
    setOwnedPlants(current => {
      const nextPlants = current.map(plant =>
        plant.ownedPlantId === ownedPlantId
          ? { ...plant, wateringHistory: plant.wateringHistory.slice(0, -1) }
          : plant,
      );
      ownedPlantsRef.current = nextPlants;
      return nextPlants;
    });
  }, []);

  const addSearchHistoryEntry = React.useCallback((species: PlantSpecies) => {
    setSearchHistory(current => [
      species,
      ...current.filter(item => item.speciesId !== species.speciesId),
    ].slice(0, MAX_SEARCH_HISTORY));
  }, []);

  const renameOwnedPlant = React.useCallback(
    (ownedPlantId: string, customName: string): PlantNameSaveResult => {
      const nextName = customName.trim();
      const currentPlants = ownedPlantsRef.current;

      if (findDuplicateName(nextName, currentPlants, ownedPlantId)) {
        return {
          duplicate: true,
          message: buildDuplicateNameMessage(nextName),
        };
      }

      setOwnedPlants(current => {
        const nextPlants = current.map(plant =>
          plant.ownedPlantId === ownedPlantId ? { ...plant, customName: nextName } : plant,
        );
        ownedPlantsRef.current = nextPlants;
        return nextPlants;
      });

      return { duplicate: false, ownedPlantId };
    },
    [],
  );

  const value = React.useMemo<PlantDataContextValue>(
    () => ({
      addSearchHistoryEntry,
      createDetection,
      deleteOwnedPlant,
      detections,
      getDetectionById: getDetectionByIdFromState,
      getOwnedPlantById,
      getSpeciesById,
      identifyAndResolveSpecies,
      lookupSpeciesByName,
      markWatered,
      ownedPlants,
      pendingLibrarySearch,
      renameOwnedPlant,
      resolveDetectionSpecies,
      resolveSpeciesById,
      saveDetection,
      searchHistory,
      setPendingLibrarySearch,
      unmarkWatered,
    }),
    [
      addSearchHistoryEntry,
      createDetection,
      deleteOwnedPlant,
      detections,
      getDetectionByIdFromState,
      getOwnedPlantById,
      getSpeciesById,
      identifyAndResolveSpecies,
      lookupSpeciesByName,
      markWatered,
      ownedPlants,
      pendingLibrarySearch,
      renameOwnedPlant,
      resolveDetectionSpecies,
      resolveSpeciesById,
      saveDetection,
      searchHistory,
      unmarkWatered,
    ],
  );

  return (
    <PlantDataContext.Provider value={value}>
      {children}
    </PlantDataContext.Provider>
  );
}

export function usePlantData() {
  const value = React.useContext(PlantDataContext);
  if (!value) throw new Error('usePlantData must be used inside PlantDataProvider');
  return value;
}
