export const DEVICE_ID_KEY = 'weekcrew:device-id';
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
    return window.sessionStorage;
  } catch (error) {
    console.warn('Session storage unavailable, falling back to localStorage', error);
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable, falling back to in-memory storage', error);
  }

  return memoryStorage;
};

const persistDeviceId = (id: string) => {
  const storage = getDeviceStorage();
  storage.setItem(DEVICE_ID_KEY, id);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  } catch (error) {
    console.warn('Failed to write device id to localStorage', error);
  }

  try {
    document.cookie = `${DEVICE_ID_KEY}=${id}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (error) {
    console.warn('Failed to persist device id cookie', error);
  }
};

export const getOrCreateDeviceId = (): string => {
  const storage = getDeviceStorage();
  const existing = (() => {
    try {
      const fromStorage = storage.getItem(DEVICE_ID_KEY);
      if (fromStorage) return fromStorage;
    } catch (error) {
      console.warn('Device storage unavailable', error);
    }

    if (typeof window === 'undefined') return null;

    try {
      return window.localStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      console.warn('LocalStorage unavailable when reading device id', error);
      return null;
    }
  })();

  if (existing) {
    return existing;
  }
  const id = generateDeviceId();
  persistDeviceId(id);
  console.info('[Device] Generated ID:', id);
  return id;
};

export const resetDeviceId = () => {
  const newId = generateDeviceId();
  persistDeviceId(newId);

  if (typeof window === 'undefined') {
    return newId;
  }

  try {
    document.cookie = `${DEVICE_ID_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${DEVICE_ID_KEY}=${newId}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (error) {
    console.warn('Failed to refresh device id cookie', error);
  }

  console.info('[Device] New ID:', newId);
  return newId;
};
