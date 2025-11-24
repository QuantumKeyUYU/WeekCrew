export const DEVICE_ID_KEY = 'weekcrew:device-id';
export const USER_ID_KEY = 'weekcrew-user';
export const DEVICE_HEADER_NAME = 'X-Device-Id';

const generateDeviceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const memoryStorage = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name: string) => storage[name] ?? null,
    setItem: (name: string, value: string) => {
      storage[name] = value;
    },
    removeItem: (name: string) => {
      delete storage[name];
    },
    clear: () => {
      storage = {};
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
    get length() {
      return Object.keys(storage).length;
    },
  } as Storage;
})();

const getDeviceStorage = (): Storage => {
  if (typeof window === 'undefined') {
    return memoryStorage;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable, falling back to sessionStorage', error);
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('Session storage unavailable, falling back to in-memory storage', error);
  }

  return memoryStorage;
};

const persistId = (storage: Storage, id: string) => {
  try {
    storage.setItem(DEVICE_ID_KEY, id);
  } catch (error) {
    console.warn('Unable to persist device id', error);
  }

  try {
    storage.setItem(USER_ID_KEY, id);
  } catch (error) {
    console.warn('Unable to persist user id', error);
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_ID_KEY, id);
    } catch (error) {
      console.warn('Unable to persist user id in localStorage', error);
    }
  }
};

export const getOrCreateDeviceId = (): string => {
  const storage = getDeviceStorage();
  const existing =
    storage.getItem(DEVICE_ID_KEY) ?? storage.getItem(USER_ID_KEY);

  if (existing) {
    persistId(storage, existing);
    return existing;
  }

  const id = generateDeviceId();
  persistId(storage, id);
  return id;
};

export const resetDeviceId = () => {
  const storage = getDeviceStorage();
  storage.removeItem(DEVICE_ID_KEY);
  storage.removeItem(USER_ID_KEY);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(DEVICE_ID_KEY);
    window.localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear device id from localStorage', error);
  }
};
