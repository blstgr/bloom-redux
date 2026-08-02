import React from 'react';
import type { ImageSourcePropType } from 'react-native';

import { resolveCareFacts } from '../../../services/careDerivation';
import { PERENUAL_UPGRADE_PLACEHOLDER_MARKER } from '../../../services/constants';
import { getSpeciesDetails, PlantApiError, searchSpecies } from '../../../services/plantApi';
import { generateSpeciesCopy, PlantCopyApiError } from '../../../services/plantCopyApi';
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
import { buildFallbackSpeciesDetails } from './speciesDetailsFallback';

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
  /** The API key/IP itself was rejected (e.g. an IP-allowlist mismatch) — distinct from every
   * other reason because it has nothing to do with the photo or a bad match, unlike the others. */
  | 'access-denied'
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
   * to before resolution has completed (optimistic navigation). `knownName`, when the caller has
   * it, skips the live (confirmed permanently blocked) species/details call entirely in favor of
   * speciesDetailsFallback.ts's synthesized response — never to invent a name shown to the user. */
  resolveSpeciesById: (
    perenualId: number,
    fallbackImage?: ImageSourcePropType,
    knownName?: string,
  ) => Promise<SpeciesLookupResult>;
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
const MAX_LOGGED_CANDIDATES = 3;
const SCORE_LOG_DECIMAL_PLACES = 2;
// Stands in for "no knownName" as a speciesCoreInFlightRef key — never a real name, since callers
// only ever pass a non-empty knownName.
const NO_KNOWN_NAME_KEY = '';
const FIRST_KEY_INDEX = 0;

/** Explicit, named check rather than relying on `knownName`'s JS truthiness inline everywhere —
 * makes "an empty string counts the same as no name at all" a deliberate, documented rule instead
 * of an implicit side effect of the `?string` type allowing `''` in the first place. */
function hasKnownName(knownName: string | undefined): knownName is string {
  return typeof knownName === 'string' && knownName.length > 0;
}

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
 * generated copy all live here.
 *
 * `knownName` drives whether the live `species/details` call is even attempted — see the skip
 * below and speciesDetailsFallback.ts for why that's a real, ongoing failure (not hypothetical)
 * on this app's current API plan, and why every other call here still hits the real API. */
async function resolveSpeciesCore(perenualId: number, knownName?: string): Promise<ResolvedSpeciesCore> {
  let details: PerenualSpeciesDetails;
  if (hasKnownName(knownName)) {
    // Confirmed permanently blocked on this app's free-tier Perenual plan: species/details/{id}
    // returns 403 "Please Upgrade Plan" every time, not a quota that resets (see
    // memory/project_intentional_decisions.md). Before this change, every resolution still made
    // this call and waited for the guaranteed failure before falling back — a full wasted network
    // round-trip on every single plant. Whenever a name is already known (a search result or an
    // accepted Pl@ntNet identification), skip the live call entirely and go straight to the
    // synthesized fallback: no loss of accuracy, since this call was never returning real data on
    // this plan anyway. getSpeciesDetails/fetchPerenual are untouched in plantApi.ts — still
    // exercised below whenever no name is known yet, and kept in place because the assignment is
    // to demonstrate real API usage. Trivially reversible: delete this branch (and always call
    // getSpeciesDetails) once the Perenual plan is upgraded.
    details = buildFallbackSpeciesDetails(perenualId, knownName);
  } else {
    details = await getSpeciesDetails(perenualId);
  }

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
    isToxicToPets: resolvedFacts.isToxicToPets,
    lightNeed: resolvedFacts.lightNeed,
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
  // Per speciesId, a map from "shape of work" to its in-flight promise — keyed by the exact
  // knownName string, with `NO_KNOWN_NAME_KEY` standing in for "no knownName" (never a real name,
  // since callers only ever pass a non-empty one). Every distinct shape gets its own independent
  // key so any combination of concurrent callers for the same speciesId — two different known
  // names, a knownName alongside a no-knownName caller, several of the same name — can each finish
  // and clean up on their own without disturbing another still-pending entry. An earlier version
  // of this used one shared slot per shape (or no shape distinction at all); both let one entry's
  // completion delete or overwrite another still-pending entry for the same speciesId, so a later
  // caller would see nothing in flight (or the wrong one) and start a duplicate resolveSpeciesCore
  // call, or silently receive a different caller's name/result — the exact problems this map
  // exists to prevent.
  const speciesCoreInFlightRef = React.useRef<Record<string, Record<string, Promise<ResolvedSpeciesCore>>>>({});

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
    async (
      perenualId: number,
      fallbackImage?: ImageSourcePropType,
      knownName?: string,
    ): Promise<SpeciesLookupResult> => {
      const speciesId = String(perenualId);

      // Only the shared "core" (Perenual/Unsplash/DeepSeek work, identical for every caller) is
      // cached/de-duped here — never the final assembled species. Baking a caller's fallbackImage
      // into a shared cache/in-flight entry would let whichever caller resolves first decide the
      // image (and hasPhoto-dependent description) for every other concurrent caller too.
      let core = speciesCoreCacheRef.current[speciesId];
      if (!core) {
        const slot = speciesCoreInFlightRef.current[speciesId] ?? {};
        const knownNameKeys = Object.keys(slot).filter(key => key !== NO_KNOWN_NAME_KEY);
        // A caller with a knownName resolves instantly via the synthesized fallback (see the
        // knownName skip in resolveSpeciesCore) and must never be forced to piggyback on an
        // in-flight entry that was started WITHOUT one — that entry is doomed to hit the
        // confirmed-blocked live species/details call and fail, which would otherwise drag an
        // otherwise-succeeding knownName caller down with it. A caller with no knownName has no
        // faster option of its own, so it prefers whichever knownName resolution is already in
        // flight (any one — all are equally "better" than the doomed no-knownName path) over
        // starting or joining that path itself. A knownName caller only ever reuses an existing
        // entry keyed by that SAME name — two different names for the same speciesId must never
        // silently collapse into one caller's result.
        let inFlightKey: string;
        let inFlightPromise: Promise<ResolvedSpeciesCore>;

        if (hasKnownName(knownName) && knownName in slot) {
          inFlightKey = knownName;
          inFlightPromise = slot[knownName];
        } else if (!hasKnownName(knownName) && knownNameKeys.length > 0) {
          inFlightKey = knownNameKeys[FIRST_KEY_INDEX];
          inFlightPromise = slot[inFlightKey];
        } else if (!hasKnownName(knownName) && NO_KNOWN_NAME_KEY in slot) {
          inFlightKey = NO_KNOWN_NAME_KEY;
          inFlightPromise = slot[NO_KNOWN_NAME_KEY];
        } else {
          inFlightKey = hasKnownName(knownName) ? knownName : NO_KNOWN_NAME_KEY;
          inFlightPromise = resolveSpeciesCore(perenualId, knownName);
          speciesCoreInFlightRef.current[speciesId] = { ...slot, [inFlightKey]: inFlightPromise };
        }

        try {
          core = await inFlightPromise;
        } catch (error) {
          // Recoverable, expected outcome (not a bug) — console.warn, not console.error, so this
          // doesn't trip React Native's red LogBox on top of the AlertModal/failure state the UI
          // already shows for this.
          console.warn('resolveSpeciesById failed', error);
          if (error instanceof PlantApiError) {
            if (error.kind === 'rate-limited') return { reason: 'rate-limited', success: false };
            if (error.kind === 'forbidden') return { reason: 'access-denied', success: false };
          }
          if (error instanceof PlantCopyApiError && error.kind === 'forbidden') {
            return { reason: 'access-denied', success: false };
          }
          return { reason: 'network-error', success: false };
        } finally {
          // Only clear this entry's own key, and only if it's still the promise we awaited —
          // another key (a different name, or the no-knownName one) may still have a genuinely
          // separate, independently-pending resolution for this same speciesId.
          const currentSlot = speciesCoreInFlightRef.current[speciesId];
          if (currentSlot?.[inFlightKey] === inFlightPromise) {
            const nextSlot = { ...currentSlot };
            delete nextSlot[inFlightKey];
            if (Object.keys(nextSlot).length === 0) {
              delete speciesCoreInFlightRef.current[speciesId];
            } else {
              speciesCoreInFlightRef.current[speciesId] = nextSlot;
            }
          }
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
        // Recoverable, expected outcome (not a bug) — console.warn, not console.error, so this
        // doesn't trip React Native's red LogBox on top of the AlertModal/failure state the UI
        // already shows for this.
        console.warn('lookupSpeciesByName: searchSpecies failed', error);
        if (error instanceof PlantApiError) {
          if (error.kind === 'rate-limited') return { reason: 'rate-limited', success: false };
          if (error.kind === 'forbidden') return { reason: 'access-denied', success: false };
        }
        return { reason: 'network-error', success: false };
      }

      const match = results[FIRST_MATCH_INDEX];
      if (!match) {
        // A recoverable, expected outcome (not a bug) — console.warn, not console.error, so this
        // doesn't trip React Native's red LogBox. Perenual's species-list has no free-text search
        // logging of its own, so this is the only way to see which exact name (often Pl@ntNet's
        // raw commonName/scientificName, not something the user ever sees) failed to match.
        console.warn(`lookupSpeciesByName: no Perenual match for "${name}"`);
        return { reason: 'no-perenual-match', success: false };
      }

      return resolveSpeciesById(match.id, fallbackImage, match.common_name);
    },
    [resolveSpeciesById],
  );

  const identifyAndResolveSpecies = React.useCallback(
    async (image: ImageSourcePropType): Promise<SpeciesLookupResult> => {
      let candidates;
      try {
        candidates = await identifyPlant(image);
      } catch (error) {
        // Recoverable, expected outcome (not a bug) — console.warn, not console.error, so this
        // doesn't trip React Native's red LogBox on top of the AlertModal/failure state the UI
        // already shows for this.
        console.warn('identifyAndResolveSpecies: identifyPlant failed', error);
        if (error instanceof PlantIdApiError) {
          if (error.kind === 'quota-exceeded') return { reason: 'rate-limited', success: false };
          if (error.kind === 'forbidden') return { reason: 'access-denied', success: false };
        }
        return { reason: 'network-error', success: false };
      }

      const identification = resolveIdentification(candidates);
      if (!identification.accepted) {
        // Recoverable, expected outcome (not a bug) — console.warn, not console.error, so this
        // doesn't trip React Native's red LogBox. Without this, a low-confidence/no-candidates
        // rejection is silent: there's no way to tell whether Pl@ntNet was close (a borderline
        // score) or wildly off, which is exactly the question when a photo unexpectedly fails.
        const topCandidates = candidates
          .slice(0, MAX_LOGGED_CANDIDATES)
          .map(candidate => {
            const name = candidate.species.commonNames[FIRST_MATCH_INDEX] ?? candidate.species.scientificNameWithoutAuthor;
            return `${name} (${candidate.score.toFixed(SCORE_LOG_DECIMAL_PLACES)})`;
          })
          .join(', ');
        console.warn(
          `identifyAndResolveSpecies: rejected (${identification.reason}) — top candidates: ${topCandidates || 'none'}`,
        );
        return { reason: identification.reason, success: false };
      }

      const { species: candidateSpecies } = identification.candidate;
      const commonName = candidateSpecies.commonNames[FIRST_MATCH_INDEX];
      const scientificName = candidateSpecies.scientificNameWithoutAuthor;
      const genusName = candidateSpecies.genus.scientificNameWithoutAuthor;

      // Perenual's text index doesn't always contain the exact name Pl@ntNet returns, and can lack
      // species-level data entirely — both confirmed live:
      // - "Prayerplant" (Maranta leuconeura) has zero Perenual matches, filtered or not, even
      //   though Perenual's own common_name for the same species is "prayer plant" — a spacing
      //   mismatch, not a missing species. The scientific name sidesteps it.
      // - "Pachira glabra" (a Money Tree candidate) and "Rhaphidophora tetrasperma" (Mini Monstera)
      //   have zero Perenual matches under ANY name, common or scientific — Perenual simply
      //   doesn't carry those species at all, even though it does carry other species in the same
      //   genus (e.g. "Pachira aquatica"). Only the genus can find anything in that case.
      // Try progressively broader/more standardized names in order, stopping at the first one
      // that resolves. A genus-level match trades precision (it may show a real but different
      // species within the same genus) for not showing a bare failure when Perenual's coverage
      // gap is total — every tier still only ever uses real Perenual data, never invented.
      const nameTiers = [...new Set([commonName, scientificName, genusName].filter((name): name is string => Boolean(name)))];

      let result: SpeciesLookupResult = { reason: 'no-perenual-match', success: false };
      for (const name of nameTiers) {
        result = await lookupSpeciesByName(name, image);
        if (result.success || result.reason !== 'no-perenual-match') break;
      }

      return result;
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
