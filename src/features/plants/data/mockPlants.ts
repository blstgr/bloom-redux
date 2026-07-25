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
  wateringIntervalDays: number;
  /** Long, same-voice-as-description article for SpeciesInfoScreen. Only set for real
   * Perenual/DeepSeek-sourced species — mock seed species fall back to repeating `description`. */
  wikiArticle?: string;
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
  /** Unset until species identification/lookup resolves. */
  generatedName?: string;
  image: ImageSourcePropType;
  /** Unset until species identification/lookup resolves — see PlantDataProvider's
   * identifyAndResolveSpecies/resolveSpeciesFromPerenualId. */
  speciesId?: string;
};

const WATERING_INTERVAL_DAYS = 14;
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
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
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
    wateringIntervalDays: 10,
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
    wateringIntervalDays: 10,
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
    wateringIntervalDays: 12,
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
    wateringIntervalDays: 12,
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
    wateringIntervalDays: 12,
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
    wateringIntervalDays: 6,
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
    wateringIntervalDays: 12,
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
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
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
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
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
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
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
    wateringIntervalDays: WATERING_INTERVAL_DAYS,
  },
];

export const initialOwnedPlants: OwnedPlant[] = [];

export function getSpeciesById(speciesId: string | undefined) {
  return mockSpecies.find(species => species.speciesId === speciesId);
}
