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
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return (response.json() as Promise<T>);
};
