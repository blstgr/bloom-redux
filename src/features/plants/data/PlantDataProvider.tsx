import React from 'react';

import {
  getSpeciesById,
  initialOwnedPlants as defaultInitialOwnedPlants,
  mockSpecies,
  type OwnedPlant,
  type PlantDetection,
  type PlantSpecies,
} from './mockPlants';

type PlantNameSaveResult =
  | {
      duplicate: false;
      ownedPlantId: string;
    }
  | {
      duplicate: true;
      message: string;
    };

export type PlantDataContextValue = {
  createDetection: (image: PlantDetection['image']) => PlantDetection;
  deleteOwnedPlant: (ownedPlantId: string) => void;
  detections: PlantDetection[];
  getDetectionById: (detectionId: string | undefined) => PlantDetection | undefined;
  getOwnedPlantById: (ownedPlantId: string | undefined) => OwnedPlant | undefined;
  getSpeciesById: (speciesId: string | undefined) => PlantSpecies | undefined;
  markWatered: (ownedPlantId: string) => void;
  ownedPlants: OwnedPlant[];
  /** Species name to prefill into the Library search box after a "search by photo" capture. */
  pendingLibrarySearch: string | null;
  renameOwnedPlant: (ownedPlantId: string, customName: string) => PlantNameSaveResult;
  saveDetection: (detectionId: string, customName: string) => PlantNameSaveResult;
  setPendingLibrarySearch: (speciesName: string | null) => void;
  species: PlantSpecies[];
  unmarkWatered: (ownedPlantId: string) => void;
};

const INITIAL_DETECTION_INDEX = 1;
const INITIAL_OWNED_PLANT_INDEX = 1;
const FIRST_DUPLICATE_SUFFIX = 2;
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

export function PlantDataProvider({
  children,
  initialOwnedPlants = defaultInitialOwnedPlants,
}: PlantDataProviderProps) {
  const [ownedPlants, setOwnedPlants] = React.useState<OwnedPlant[]>(initialOwnedPlants);
  const [detections, setDetections] = React.useState<PlantDetection[]>([]);
  const [pendingLibrarySearch, setPendingLibrarySearch] = React.useState<string | null>(null);
  const ownedPlantsRef = React.useRef<OwnedPlant[]>(initialOwnedPlants);
  const detectionIndexRef = React.useRef(INITIAL_DETECTION_INDEX);
  const ownedPlantIndexRef = React.useRef(getNextOwnedPlantIndex(initialOwnedPlants));

  const createDetection = React.useCallback((image: PlantDetection['image']) => {
    const species = mockSpecies[0];
    const detection: PlantDetection = {
      detectionId: `detection-${detectionIndexRef.current}`,
      generatedName: buildGeneratedName(species.speciesName, ownedPlantsRef.current),
      image,
      speciesId: species.speciesId,
    };

    detectionIndexRef.current += 1;
    setDetections(current => [...current, detection]);
    return detection;
  }, []);

  const getDetectionByIdFromState = React.useCallback(
    (detectionId: string | undefined) =>
      detections.find(detection => detection.detectionId === detectionId),
    [detections],
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
    [detections],
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
      createDetection,
      deleteOwnedPlant,
      detections,
      getDetectionById: getDetectionByIdFromState,
      getOwnedPlantById,
      getSpeciesById,
      markWatered,
      ownedPlants,
      pendingLibrarySearch,
      renameOwnedPlant,
      saveDetection,
      setPendingLibrarySearch,
      species: mockSpecies,
      unmarkWatered,
    }),
    [
      createDetection,
      deleteOwnedPlant,
      detections,
      getDetectionByIdFromState,
      getOwnedPlantById,
      markWatered,
      ownedPlants,
      pendingLibrarySearch,
      renameOwnedPlant,
      saveDetection,
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
