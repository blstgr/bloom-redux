import type { TabItem } from '../../../components/ui/Tabs';

import { getDifficulty } from './difficulty';
import type { PlantSpecies } from './types';

/** The full set of valid tab keys, as a literal union — lets FavoritesScreen's matchesTab switch
 * over this type and get a compile error if a key here is ever added without a matching case,
 * instead of an unhandled key silently falling through to a default branch. */
export type FavoritesTabKey = 'all' | 'easy' | 'manageable' | 'diva' | 'pet-safe' | 'bright' | 'shade';

/** See docs/favs-spec.md for what each tab axis matches. */
export const FAVORITES_TABS: (TabItem & { key: FavoritesTabKey })[] = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy Peasy' },
  { key: 'manageable', label: 'Somewhat Needy' },
  { key: 'diva', label: 'High-Maintenance' },
  { key: 'pet-safe', label: 'Pet Approved' },
  { key: 'bright', label: 'Sun Worshipper' },
  { key: 'shade', label: 'Shade Lurker' },
];

/** Throws instead of silently matching everything — reached only if a new FavoritesTabKey is
 * added to favoritesTabs.ts without a matching case below, which TypeScript already refuses to
 * compile (the `default` branch's `tabKey` narrows to `never` once every real case is handled). */
function assertUnhandledTabKey(tabKey: never): never {
  throw new Error(`Unhandled favorites tab key: ${String(tabKey)}`);
}

/** The rule each tab key stands for. Lives beside the keys it interprets so adding a tab is one
 * file, not two: the exhaustive switch below fails to compile the moment a key has no rule. */
export function matchesTab(species: PlantSpecies, tabKey: FavoritesTabKey): boolean {
  switch (tabKey) {
    case 'all':
      return true;
    case 'easy':
    case 'manageable':
    case 'diva':
      return getDifficulty(species.wateringIntervalDays) === tabKey;
    case 'pet-safe':
      return !species.isToxicToPets;
    case 'bright':
      return species.lightNeed === 'bright';
    case 'shade':
      return species.lightNeed === 'low';
    default:
      return assertUnhandledTabKey(tabKey);
  }
}
