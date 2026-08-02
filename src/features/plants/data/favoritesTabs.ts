import type { TabItem } from '../../../components/ui/Tabs';

/** The full set of valid tab keys, as a literal union — lets FavoritesScreen's matchesTab switch
 * over this type and get a compile error if a key here is ever added without a matching case,
 * instead of an unhandled key silently falling through to a default branch. */
export type FavoritesTabKey = 'all' | 'easy' | 'manageable' | 'diva' | 'pet-safe' | 'bright' | 'shade';

/** Shared between FavoritesScreen (the real UI) and Tabs.stories.tsx (the Storybook demo data) so
 * the two can never drift out of sync — see docs/favs-spec.md for what each tab axis matches. */
export const FAVORITES_TABS: (TabItem & { key: FavoritesTabKey })[] = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy Peasy' },
  { key: 'manageable', label: 'Somewhat Needy' },
  { key: 'diva', label: 'High-Maintenance' },
  { key: 'pet-safe', label: 'Pet Approved' },
  { key: 'bright', label: 'Sun Worshipper' },
  { key: 'shade', label: 'Shade Lurker' },
];
