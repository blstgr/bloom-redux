import type { UnsplashSearchResponse } from './types';
import { searchPhoto } from './unsplashApi';

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce(response) as unknown as typeof fetch;
}

describe('searchPhoto', () => {
  it('returns the first result photo url on success', async () => {
    const payload: UnsplashSearchResponse = {
      results: [{ urls: { regular: 'https://images.unsplash.com/photo-1' } }],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchPhoto('monstera')).toBe('https://images.unsplash.com/photo-1');
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
