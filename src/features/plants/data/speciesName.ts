/**
 * Title-cases an API-sourced species name so it matches the seed data's convention
 * ('Prayer Plant', 'Money Tree'). Perenual returns `common_name` lowercase, which otherwise
 * renders next to Title Case seed names.
 *
 * Only the first letter of each word is raised; the rest of every word is left untouched, so
 * names that already carry meaningful capitals survive ('ZZ plant' -> 'ZZ Plant', not 'Zz Plant').
 */
export function toDisplaySpeciesName(name: string): string {
  return name.replace(/(^|[\s(\-/])([a-z])/g, (_match, boundary: string, letter: string) =>
    `${boundary}${letter.toUpperCase()}`,
  );
}
