import { getSpeciesDetails, PlantApiError, searchSpecies } from './plantApi';
import type { PerenualSpeciesDetails, PerenualSpeciesListResponse } from './types';

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValueOnce(response) as unknown as typeof fetch;
}

function mockFetchSequence(...responses: Partial<Response>[]) {
  const fetchMock = jest.fn();
  responses.forEach(response => fetchMock.mockResolvedValueOnce(response));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function mockFetchRejectOnce() {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('offline')) as unknown as typeof fetch;
}

describe('searchSpecies', () => {
  it('returns the data array on success', async () => {
    const payload: PerenualSpeciesListResponse = {
      data: [{ common_name: 'ZZ plant', default_image: null, id: 42, scientific_name: ['Zamioculcas zamiifolia'] }],
    };
    mockFetchOnce({ json: () => Promise.resolve(payload), ok: true });

    const results = await searchSpecies('zz');
    expect(results).toEqual(payload.data);
  });

  it('returns an empty array when neither the indoor-filtered nor unfiltered search matches', async () => {
    const fetchMock = mockFetchSequence(
      { json: () => Promise.resolve({ data: [] }), ok: true },
      { json: () => Promise.resolve({ data: [] }), ok: true },
    );
    expect(await searchSpecies('nonexistent-species')).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to an unfiltered search when the indoor-filtered one comes up empty', async () => {
    const payload: PerenualSpeciesListResponse = {
      data: [{ common_name: 'Some Outdoor-Tagged Houseplant', default_image: null, id: 7, scientific_name: ['Genus species'] }],
    };
    const fetchMock = mockFetchSequence(
      { json: () => Promise.resolve({ data: [] }), ok: true },
      { json: () => Promise.resolve(payload), ok: true },
    );

    const results = await searchSpecies('some outdoor-tagged houseplant');

    expect(results).toEqual(payload.data);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toEqual(expect.stringContaining('indoor=1'));
    expect(fetchMock.mock.calls[1][0]).not.toEqual(expect.stringContaining('indoor=1'));
  });

  it('does not make a second request when the indoor-filtered search already matches', async () => {
    const payload: PerenualSpeciesListResponse = {
      data: [{ common_name: 'ZZ plant', default_image: null, id: 42, scientific_name: ['Zamioculcas zamiifolia'] }],
    };
    const fetchMock = mockFetchSequence({ json: () => Promise.resolve(payload), ok: true });

    expect(await searchSpecies('zz')).toEqual(payload.data);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws a network PlantApiError when fetch rejects', async () => {
    mockFetchRejectOnce();
    await expect(searchSpecies('zz')).rejects.toMatchObject<Partial<PlantApiError>>({ kind: 'network' });
  });

  it('throws a PlantApiError on a non-2xx response', async () => {
    mockFetchOnce({ ok: false, status: 500 });
    await expect(searchSpecies('zz')).rejects.toBeInstanceOf(PlantApiError);
  });

  it('throws rate-limited with the response body appended, to distinguish burst vs daily quota', async () => {
    mockFetchOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve('{"message":"Daily limit of 100 requests exceeded"}'),
    });

    await expect(searchSpecies('zz')).rejects.toMatchObject<Partial<PlantApiError>>({
      kind: 'rate-limited',
      message: expect.stringContaining('Daily limit of 100 requests exceeded'),
    });
  });

  it('still throws rate-limited when the response has no readable body', async () => {
    mockFetchOnce({ ok: false, status: 429 });
    await expect(searchSpecies('zz')).rejects.toMatchObject<Partial<PlantApiError>>({ kind: 'rate-limited' });
  });

  it('throws forbidden with the response body on a 403 (e.g. IP not allowed), distinct from unknown', async () => {
    mockFetchOnce({ ok: false, status: 403, text: () => Promise.resolve('error: remote IP not allowed') });
    await expect(searchSpecies('zz')).rejects.toMatchObject<Partial<PlantApiError>>({
      kind: 'forbidden',
      message: expect.stringContaining('remote IP not allowed'),
    });
  });
});

describe('getSpeciesDetails', () => {
  it('returns the parsed details on success', async () => {
    const details: PerenualSpeciesDetails = {
      care_level: 'Moderate',
      common_name: 'ZZ plant',
      default_image: null,
      dimensions: null,
      growth_rate: 'Low',
      id: 42,
      poisonous_to_humans: false,
      poisonous_to_pets: true,
      scientific_name: ['Zamioculcas zamiifolia'],
      sunlight: ['part shade'],
      watering_general_benchmark: { unit: 'days', value: '14' },
    };
    mockFetchOnce({ json: () => Promise.resolve(details), ok: true });

    expect(await getSpeciesDetails(42)).toEqual(details);
  });

  it('throws a network PlantApiError when fetch rejects', async () => {
    mockFetchRejectOnce();
    await expect(getSpeciesDetails(42)).rejects.toMatchObject<Partial<PlantApiError>>({ kind: 'network' });
  });
});
