import { PLANT_DESCRIPTION_MAX_CHARS } from '../features/plants/data/plantDescription';

import { getDeepSeekApiKey } from './config';
import { DEEPSEEK_BASE_URL } from './constants';
import type { GeneratedSpeciesCopy, PerenualSpeciesDetails, ResolvedCareFacts } from './types';

export type PlantCopyApiErrorKind = 'network' | 'unknown';

export class PlantCopyApiError extends Error {
  kind: PlantCopyApiErrorKind;

  constructor(kind: PlantCopyApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'PlantCopyApiError';
  }
}

const DEEPSEEK_MODEL = 'deepseek-chat';
const RETRY_BUDGET_MARGIN = 20;

function buildPrompt(resolvedFacts: ResolvedCareFacts, rawDetails: PerenualSpeciesDetails, budget: number) {
  return `You are writing plant care copy for a houseplant app. These facts are fixed and must
appear, phrased naturally, but never changed or contradicted:
- Watering interval: every ${resolvedFacts.wateringIntervalDays} days
- Pot size: drainage holes ${resolvedFacts.potSizeRecommendationCm} cm larger than the roots
- Repotting: every ${resolvedFacts.repottingScheduleYears} years
- Toxic to pets: ${resolvedFacts.isToxicToPets ? 'yes' : 'no'}
- Care level: ${rawDetails.care_level ?? 'unknown'}
- Sunlight: ${(rawDetails.sunlight ?? []).join(', ') || 'unknown'}

Return strict JSON with exactly these keys:
- "category": a short, funny/creative label summarizing how demanding this plant is (e.g.
  "Independent Roommate", "High-Maintenance Diva"), grounded in the care level above, not a new
  fact.
- "description": ${budget} characters or fewer. Required facts first (watering, pot size,
  repotting, toxicity), creative flourish last, so truncation only ever cuts flavor text.
- "wikiArticle": a longer article in the same voice, covering all the facts above plus anything
  else relevant (sunlight, care level, etc). No length limit. Separate paragraphs with a blank
  line (\\n\\n) so the app can render them as distinct paragraphs.`;
}

async function requestGeneration(
  resolvedFacts: ResolvedCareFacts,
  rawDetails: PerenualSpeciesDetails,
  budget: number,
): Promise<GeneratedSpeciesCopy> {
  let response: Response;
  try {
    response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      body: JSON.stringify({
        messages: [{ content: buildPrompt(resolvedFacts, rawDetails, budget), role: 'user' }],
        model: DEEPSEEK_MODEL,
        response_format: { type: 'json_object' },
      }),
      headers: {
        Authorization: `Bearer ${getDeepSeekApiKey()}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    throw new PlantCopyApiError('network', 'Could not reach the copy generation service.');
  }

  if (!response.ok) {
    throw new PlantCopyApiError('unknown', `Copy generation failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const content: string | undefined = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new PlantCopyApiError('unknown', 'Copy generation returned no content.');
  }

  let parsed: GeneratedSpeciesCopy;
  try {
    parsed = JSON.parse(content) as GeneratedSpeciesCopy;
  } catch {
    throw new PlantCopyApiError('unknown', 'Copy generation returned malformed JSON.');
  }

  if (
    typeof parsed.category !== 'string' ||
    typeof parsed.description !== 'string' ||
    typeof parsed.wikiArticle !== 'string'
  ) {
    throw new PlantCopyApiError('unknown', 'Copy generation response is missing required fields.');
  }

  return parsed;
}

function trimToSentenceBoundary(text: string, maxLength: number): string {
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  return lastPeriod > 0 ? truncated.slice(0, lastPeriod + 1) : truncated;
}

/**
 * One DeepSeek request produces the short description and the long wiki article together, so
 * they can never drift out of sync with each other or with resolvedFacts. Regenerates once with
 * a tighter budget if the description overflows PLANT_DESCRIPTION_MAX_CHARS, then falls back to a
 * deterministic sentence-boundary trim rather than let an overlong description reach
 * buildPlantDescription-shaped consumers.
 *
 * Deliberately doesn't know whether a real species photo was found — that's resolved
 * independently (in parallel, not sequentially) by the caller, which prepends a deterministic
 * (non-generated) acknowledgment sentence itself when there's no photo. Keeping this function
 * photo-agnostic is what lets photo search and copy generation run concurrently instead of
 * stacking their latency.
 */
export async function generateSpeciesCopy(
  resolvedFacts: ResolvedCareFacts,
  rawDetails: PerenualSpeciesDetails,
): Promise<GeneratedSpeciesCopy> {
  let copy = await requestGeneration(resolvedFacts, rawDetails, PLANT_DESCRIPTION_MAX_CHARS);

  if (copy.description.length > PLANT_DESCRIPTION_MAX_CHARS) {
    copy = await requestGeneration(resolvedFacts, rawDetails, PLANT_DESCRIPTION_MAX_CHARS - RETRY_BUDGET_MARGIN);
  }

  if (copy.description.length > PLANT_DESCRIPTION_MAX_CHARS) {
    copy = { ...copy, description: trimToSentenceBoundary(copy.description, PLANT_DESCRIPTION_MAX_CHARS) };
  }

  return copy;
}
