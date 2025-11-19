import { DEVICE_HEADER_NAME, getOrCreateDeviceId } from '@/lib/device';

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

type JsonRequestInit = FetchInit & { json?: unknown };

const buildHeaders = (init?: FetchInit) => {
  const headers = new Headers(init?.headers ?? undefined);
  if (typeof window !== 'undefined') {
    const deviceId = getOrCreateDeviceId();
    headers.set(DEVICE_HEADER_NAME, deviceId);
  }
  return headers;
};

export class ApiError extends Error {
  status: number;

  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiFetch = (input: FetchInput, init?: FetchInit) => {
  const headers = buildHeaders(init);
  return fetch(input, { ...init, headers, cache: 'no-store' });
};

export const fetchJson = async <T>(input: FetchInput, init?: JsonRequestInit): Promise<T> => {
  const { json, ...rest } = init ?? {};
  const headers = buildHeaders(rest);
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(input, {
    ...rest,
    headers,
    cache: 'no-store',
    body: json !== undefined ? JSON.stringify(json) : rest?.body,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message = typeof data === 'string' ? data : response.statusText;
    throw new ApiError(
      response.status,
      message || `Request failed with status ${response.status}`,
      data,
    );
  }

  return data as T;
};
