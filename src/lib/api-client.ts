import { getOrCreateDeviceId } from './device';

type ApiOptions = (Parameters<typeof fetch>[1] & { json?: Record<string, unknown> | undefined }) | undefined;

export async function apiRequest<T>(url: string, options?: ApiOptions): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('x-device-id', getOrCreateDeviceId());

  let body = options?.body;
  if (options?.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.json);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch (error) {
    console.warn('Failed to parse API response', error);
  }

  if (!response.ok) {
    const message = payload?.error ?? 'Сервер сейчас не отвечает. Попробуй ещё раз.';
    throw new Error(message);
  }

  return payload as T;
}
