/**
 * `speciesId` on a PlantSpecies is a string spanning two id namespaces that look identical to
 * TypeScript:
 *
 * - **Perenual ids** — `String(perenualId)`, e.g. `"42"`. Resolvable: `resolveSpeciesById` can
 *   fetch the real species behind them.
 * - **Seed slugs** — the curated species in `mockPlants.ts`, e.g. `"zz-plant"`. Not resolvable;
 *   there is no remote record to fetch.
 *
 * "Only numerically-parseable ids are resolvable" is a real, load-bearing rule that the type
 * `string` cannot express, so callers used to rediscover it inline with a bare `Number.isNaN`
 * check. This module gives the rule one name, one implementation and one place to test.
 */

/** A `speciesId` known to address a Perenual record. Produced only by `toPerenualSpeciesId`, so
 * holding one is proof the check was actually performed rather than assumed. */
export type PerenualSpeciesId = number & { readonly __brand: unique symbol };

/**
 * The numeric Perenual id behind a `speciesId`, or null when it names a seed species instead.
 *
 * Null is the honest answer for a seed slug, not an error: those species are already complete
 * locally and never need resolving.
 */
export function toPerenualSpeciesId(speciesId: string | undefined): PerenualSpeciesId | null {
  if (!speciesId) return null;

  const parsed = Number(speciesId);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;

  return parsed as PerenualSpeciesId;
}
