import { vi } from 'vitest';

type MockJsonResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createJsonResponse(data: unknown, status = 200): MockJsonResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

export function mockFetchJsonSequence(...responses: Array<[unknown, number?]>) {
  const fetchMock = vi.fn<typeof fetch>();
  responses.forEach(([data, status]) => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(data, status) as unknown as Response
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function mockFetchRejectedOnce(error: Error) {
  const fetchMock = vi.fn<typeof fetch>();
  fetchMock.mockRejectedValueOnce(error);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function seedLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function createConsoleErrorSpy() {
  return vi.spyOn(console, 'error').mockImplementation(() => undefined);
}
