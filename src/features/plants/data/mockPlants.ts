import type { ImageSourcePropType } from 'react-native';

import { buildPlantDescription } from './plantDescription';

const marbleQueenPothos = require('../../../assets/images/marble-queen-pothos.jpg');
const moneyTree = require('../../../assets/images/money-tree.jpg');
// Temporary Monstera 3 owned-plant photo for the mock dataset. Replace with a final licensed
// release asset before shipping the production seed data.
const temporaryMonsteraThree = require('../../../assets/images/monstera-3-temporary.jpg');
const monsteraSunset = require('../../../assets/images/monstera-deliciosa-sunset.jpg');
const monsteraFull = require('../../../assets/images/monstera-deliciosa.jpg');
const parlorPalm = require('../../../assets/images/parlor-palm.jpg');
const prayerPlant = require('../../../assets/images/prayer-plant.jpg');
const rubberPlant = require('../../../assets/images/rubber-plant.jpg');
const variegatedPeperomia = require('../../../assets/images/variegated-peperomia.jpg');
const zzPlant = require('../../../assets/images/zz-plant.jpg');

export type PlantSpecies = {
  category: string;
  description: string;
  detailImage: ImageSourcePropType;
  detailImageUrl: string;
  image: ImageSourcePropType;
  speciesId: string;
  speciesName: string;
  wateringDay: string;
  wateringIntervalDays: number;
  wateringMonth: string;
};

export type OwnedPlant = {
  addedAt: string;
  customName: string;
  /** The user's actual plant photo; species/API images stay in PlantSpecies. */
  image: ImageSourcePropType;
  ownedPlantId: string;
  speciesId: string;
  /** Watering events, oldest first. Undo removes only the most recent entry. */
  wateringHistory: string[];
};

export type PlantDetection = {
  detectionId: string;
  generatedName: string;
  image: ImageSourcePropType;
  speciesId: string;
};

const WATERING_INTERVAL_DAYS = 14;
const RECENT_WATERING_DATE = '2026-07-05T12:00:00.000Z';
const DETAIL_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900',
  'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=900',
  'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=900',
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=900',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900',
  'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?w=900',
];

export const mockSpecies: PlantSpecies[] = [
  {
    category: 'Independent Roommate',
    description: buildPlantDescription({
      careNote: 'tolerates low light and mild neglect',
      light: 'bright indirect light',
      potSizeCm: '2-4',
      repotYears: '2-3',
      wateringIntervalDays: WATERING_INTERVAL_DAYS,
    }),
    detailImage: zzPlant,
    detailImageUrl: DETAIL_IMAGE_URLS[1],
    image: zzPlant,
    speciesId: 'zz-plant',
    speciesName: 'ZZ plant',
    wateringDay: '15',
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
    wateringMonth: 'May',
  },
  {
    category: 'High-Maintenance Diva',
    description: buildPlantDescription({
      careNote: 'needs steady warmth to avoid sulking',
      light: 'bright indirect light',
      potSizeCm: '4-6',
      repotYears: '2',
      wateringIntervalDays: 10,
    }),
    detailImage: monsteraSunset,
    detailImageUrl: DETAIL_IMAGE_URLS[0],
    image: monsteraFull,
    speciesId: 'monstera-deliciosa',
    speciesName: 'Monstera Deliciosa',
    wateringDay: '16',
    wateringIntervalDays: 10,
    wateringMonth: 'May',
  },
  {
    category: 'Chaotic Overachiever',
    description: buildPlantDescription({
      careNote: 'keeps its marbling best with steady care',
      light: 'bright indirect light',
      potSizeCm: '2-4',
      repotYears: '2',
      wateringIntervalDays: 10,
    }),
    detailImage: marbleQueenPothos,
    detailImageUrl: DETAIL_IMAGE_URLS[2],
    image: marbleQueenPothos,
    speciesId: 'marble-queen-pothos',
    speciesName: 'Marble Queen Pothos',
    wateringDay: '17',
    wateringIntervalDays: 10,
    wateringMonth: 'May',
  },
  {
    category: 'Low-Key Homebody',
    description: buildPlantDescription({
      careNote: 'handles normal room humidity calmly',
      light: 'low to bright indirect light',
      potSizeCm: '2-3',
      repotYears: '3',
      wateringIntervalDays: 12,
    }),
    detailImage: parlorPalm,
    detailImageUrl: DETAIL_IMAGE_URLS[3],
    image: parlorPalm,
    speciesId: 'parlor-palm',
    speciesName: 'Parlor Palm',
    wateringDay: '18',
    wateringIntervalDays: 12,
    wateringMonth: 'May',
  },
  {
    category: 'Lucky Charm',
    description: buildPlantDescription({
      careNote: 'prefers a consistent care rhythm',
      light: 'bright indirect light',
      potSizeCm: '3-5',
      repotYears: '2',
      wateringIntervalDays: 12,
    }),
    detailImage: moneyTree,
    detailImageUrl: DETAIL_IMAGE_URLS[4],
    image: moneyTree,
    speciesId: 'money-tree',
    speciesName: 'Money Tree',
    wateringDay: '19',
    wateringIntervalDays: 12,
    wateringMonth: 'May',
  },
  {
    category: 'Silent Guardian',
    description: buildPlantDescription({
      careNote: 'dislikes being moved once settled',
      light: 'bright indirect light',
      potSizeCm: '3-5',
      repotYears: '2',
      wateringIntervalDays: 12,
    }),
    detailImage: rubberPlant,
    detailImageUrl: DETAIL_IMAGE_URLS[5],
    image: rubberPlant,
    speciesId: 'rubber-plant',
    speciesName: 'Rubber Plant',
    wateringDay: '20',
    wateringIntervalDays: 12,
    wateringMonth: 'May',
  },
  {
    category: 'Dramatic Perfectionist',
    description: buildPlantDescription({
      careNote: 'prefers consistently moist soil',
      light: 'medium indirect light',
      potSizeCm: '2-3',
      repotYears: '2',
      wateringIntervalDays: 6,
    }),
    detailImage: prayerPlant,
    detailImageUrl: DETAIL_IMAGE_URLS[0],
    image: prayerPlant,
    speciesId: 'prayer-plant',
    speciesName: 'Prayer Plant',
    wateringDay: '21',
    wateringIntervalDays: 6,
    wateringMonth: 'May',
  },
  {
    category: 'Easygoing Buddy',
    description: buildPlantDescription({
      careNote: 'tolerates dry spells with thick leaves',
      light: 'medium indirect light',
      potSizeCm: '2-3',
      repotYears: '3',
      wateringIntervalDays: 12,
    }),
    detailImage: variegatedPeperomia,
    detailImageUrl: DETAIL_IMAGE_URLS[1],
    image: variegatedPeperomia,
    speciesId: 'variegated-peperomia',
    speciesName: 'Variegated Peperomia',
    wateringDay: '22',
    wateringIntervalDays: 12,
    wateringMonth: 'May',
  },
  {
    category: 'Desert minimalist',
    description: buildPlantDescription({
      careNote: 'only needs water when fully dry',
      light: 'bright filtered light',
      potSizeCm: '2-3',
      repotYears: '3',
      wateringIntervalDays: WATERING_INTERVAL_DAYS,
    }),
    detailImage: temporaryMonsteraThree,
    detailImageUrl: DETAIL_IMAGE_URLS[3],
    image: temporaryMonsteraThree,
    speciesId: 'zebra-haworthia',
    speciesName: 'Zebra Haworthia',
    wateringDay: '18',
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
    wateringMonth: 'May',
  },
  {
    category: 'Tiny survivor',
    description: buildPlantDescription({
      careNote: 'handles dry spells with sharp drainage',
      light: 'bright filtered light',
      potSizeCm: '2-3',
      repotYears: '3',
      wateringIntervalDays: WATERING_INTERVAL_DAYS,
    }),
    detailImage: marbleQueenPothos,
    detailImageUrl: DETAIL_IMAGE_URLS[4],
    image: marbleQueenPothos,
    speciesId: 'zebra-cactus',
    speciesName: 'Zebra Cactus',
    wateringDay: '19',
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
    wateringMonth: 'May',
  },
  {
    category: 'Striped drama',
    description: buildPlantDescription({
      careNote: 'grows quickly without soggy roots',
      light: 'bright indirect light',
      potSizeCm: '2-4',
      repotYears: '2',
      wateringIntervalDays: WATERING_INTERVAL_DAYS,
    }),
    detailImage: prayerPlant,
    detailImageUrl: DETAIL_IMAGE_URLS[5],
    image: prayerPlant,
    speciesId: 'zebrina',
    speciesName: 'Zebrina',
    wateringDay: '20',
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
    wateringMonth: 'May',
  },
  {
    category: 'Holiday bloomer',
    description: buildPlantDescription({
      careNote: 'likes a cooler rest before blooms',
      light: 'bright indirect light',
      potSizeCm: '2-4',
      repotYears: '2-3',
      wateringIntervalDays: WATERING_INTERVAL_DAYS,
    }),
    detailImage: variegatedPeperomia,
    detailImageUrl: DETAIL_IMAGE_URLS[0],
    image: variegatedPeperomia,
    speciesId: 'zygocactus',
    speciesName: 'Zygocactus',
    wateringDay: '21',
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
    wateringMonth: 'May',
  },
];

export const initialOwnedPlants: OwnedPlant[] = [
  {
    addedAt: '2026-06-01T09:00:00.000Z',
    customName: 'ZZ plant',
    image: zzPlant,
    ownedPlantId: 'owned-plant-1',
    speciesId: 'zz-plant',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-02T09:00:00.000Z',
    customName: 'Monstera',
    image: monsteraFull,
    ownedPlantId: 'owned-plant-2',
    speciesId: 'monstera-deliciosa',
    wateringHistory: [],
  },
  {
    addedAt: '2026-06-03T09:00:00.000Z',
    customName: 'Monstera by the Wall',
    image: monsteraSunset,
    ownedPlantId: 'owned-plant-3',
    speciesId: 'monstera-deliciosa',
    wateringHistory: [],
  },
  {
    addedAt: '2026-06-04T09:00:00.000Z',
    customName: 'Monstera Window Leaf',
    image: temporaryMonsteraThree,
    ownedPlantId: 'owned-plant-4',
    speciesId: 'monstera-deliciosa',
    wateringHistory: [],
  },
  {
    addedAt: '2026-06-05T09:00:00.000Z',
    customName: 'Marble Pothos',
    image: marbleQueenPothos,
    ownedPlantId: 'owned-plant-5',
    speciesId: 'marble-queen-pothos',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-06T09:00:00.000Z',
    customName: 'Parlor Palm',
    image: parlorPalm,
    ownedPlantId: 'owned-plant-6',
    speciesId: 'parlor-palm',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-07T09:00:00.000Z',
    customName: 'Money Tree',
    image: moneyTree,
    ownedPlantId: 'owned-plant-7',
    speciesId: 'money-tree',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-08T09:00:00.000Z',
    customName: 'Rubber Plant',
    image: rubberPlant,
    ownedPlantId: 'owned-plant-8',
    speciesId: 'rubber-plant',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-09T09:00:00.000Z',
    customName: 'Prayer Plant',
    image: prayerPlant,
    ownedPlantId: 'owned-plant-9',
    speciesId: 'prayer-plant',
    wateringHistory: [RECENT_WATERING_DATE],
  },
  {
    addedAt: '2026-06-10T09:00:00.000Z',
    customName: 'Peperomia',
    image: variegatedPeperomia,
    ownedPlantId: 'owned-plant-10',
    speciesId: 'variegated-peperomia',
    wateringHistory: [RECENT_WATERING_DATE],
  },
];

export function getSpeciesById(speciesId: string | undefined) {
  return mockSpecies.find(species => species.speciesId === speciesId);
}
