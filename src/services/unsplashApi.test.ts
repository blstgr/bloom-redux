import type { UnsplashSearchResponse } from './types';
import { searchPhoto } from './unsplashApi';

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce(response) as unknown as typeof fetch;
}

describe('searchPhoto', () => {
  it('returns the first result photo url on success', async () => {
    const payload: UnsplashSearchResponse = {
      results: [{ alt_description: 'a monstera leaf', description: null, urls: { regular: 'https://images.unsplash.com/photo-1' } }],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('monstera')).toBe('https://images.unsplash.com/photo-1');
  });

  it('prefers a result whose own text confirms the query over an irrelevant top-ranked hit', async () => {
    // Reproduces a real, confirmed case: Unsplash's #1 hit for "ZZ plant" is a rubber plant photo
    // generically tagged "green leaf plant" (no "zz"), while a genuine match sits at position 2.
    const payload: UnsplashSearchResponse = {
      results: [
        { alt_description: 'green leaf plant', description: null, urls: { regular: 'https://images.unsplash.com/rubber-plant' } },
        { alt_description: 'zz plant stem against white background', description: null, urls: { regular: 'https://images.unsplash.com/zz-plant' } },
      ],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('ZZ plant')).toBe('https://images.unsplash.com/zz-plant');
  });

  it('does not confirm a match on independently-present words describing unrelated things', async () => {
    // Reproduces a real, confirmed false positive: a fashion portrait's own `description` field
    // contains both "ponytail" (the model's hairstyle) and "palm" (blurry background trees) for
    // the query "ponytail palm" — present, but nowhere near each other and not about the plant.
    // Result 2 has the words genuinely adjacent, as a description actually about the plant would.
    const payload: UnsplashSearchResponse = {
      results: [
        {
          alt_description: 'Stylish woman in white linen shirt and shorts outdoors.',
          description:
            'A stunning portrait of a young blonde woman with her hair in a high ponytail, ' +
            'posing against a tropical background with blurry palm trees.',
          urls: { regular: 'https://images.unsplash.com/fashion-photo' },
        },
        {
          alt_description: 'a ponytail palm in a white pot',
          description: null,
          urls: { regular: 'https://images.unsplash.com/ponytail-palm' },
        },
      ],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('ponytail palm')).toBe('https://images.unsplash.com/ponytail-palm');
  });

  it('never promotes a non-plant photo that matches only part of the name', async () => {
    // Reproduces the real, confirmed case that broke SpeciesInfoScreen: for "prayer plant" the
    // live API ranks plant photos at 0-7 and a praying statue at 8. Matching on the name's
    // distinguishing part alone ("prayer", after stripping the generic word "plant") reached past
    // eight plants to pick the statue. Systematic for common-noun names: money tree, rubber/
    // snake/spider plant. The whole phrase must match, or no name match is claimed at all.
    const payload: UnsplashSearchResponse = {
      results: [
        { alt_description: 'green and brown plant in brown clay pot', description: null, urls: { regular: 'https://images.unsplash.com/clay-pot-plant' } },
        { alt_description: 'happy birthday greeting card', description: null, urls: { regular: 'https://images.unsplash.com/birthday-card' } },
        { alt_description: 'Stone angel statue with hands clasped in prayer', description: 'Angel Statue', urls: { regular: 'https://images.unsplash.com/statue' } },
      ],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('prayer plant')).toBe('https://images.unsplash.com/clay-pot-plant');
  });

  it('returns null rather than a non-plant photo when nothing plausible is ranked', async () => {
    // Unsplash's ranking is trusted only for a result that at least reads as a plant. When even
    // that fails, null lets findSpeciesPhotoUrl try the next name tier instead of committing to
    // something absurd.
    const payload: UnsplashSearchResponse = {
      results: [
        { alt_description: 'happy birthday to you card', description: null, urls: { regular: 'https://images.unsplash.com/card' } },
        { alt_description: 'Stone angel statue with hands clasped in prayer', description: 'Angel Statue', urls: { regular: 'https://images.unsplash.com/statue' } },
      ],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('some obscure cultivar')).toBeNull();
  });

  it('falls back to the top-ranked hit when no result text confirms the query', async () => {
    const payload: UnsplashSearchResponse = {
      results: [
        { alt_description: 'a green plant in a pot', description: null, urls: { regular: 'https://images.unsplash.com/unconfirmed' } },
      ],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('zebra haworthia')).toBe('https://images.unsplash.com/unconfirmed');
  });

  it('returns null when there are no results', async () => {
    mockFetchOnce({ json: () => Promise.resolve({ results: [] }), ok: true });
    expect(await searchPhoto('an extremely obscure cultivar name')).toBeNull();
  });

  it('returns null (not a throw) when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('offline')) as unknown as typeof fetch;
    expect(await searchPhoto('monstera')).toBeNull();
  });

  it('returns null (not a throw) on a non-2xx response', async () => {
    mockFetchOnce({ ok: false, status: 500 });
    expect(await searchPhoto('monstera')).toBeNull();
  });
});
