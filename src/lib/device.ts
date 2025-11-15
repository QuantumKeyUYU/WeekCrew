export const DEVICE_ID_KEY = 'weekcrew:device-id';

const generateDeviceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return generateDeviceId();
  }
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = generateDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
};

export const resetDeviceId = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(DEVICE_ID_KEY);
};
