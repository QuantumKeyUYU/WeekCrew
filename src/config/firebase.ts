import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from 'firebase/auth';

type FirebaseStatus = {
  configured: boolean;
  initialized: boolean;
  error?: string;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const requiredKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter((key) => {
  const value = firebaseConfig[key];
  return typeof value !== 'string' || value.trim().length === 0;
});

let firebaseApp: FirebaseApp | null = null;
let initializationError: unknown = null;
let missingConfigWarned = false;

const isBrowser = () => typeof window !== 'undefined';

export const isFirebaseConfigured = missingKeys.length === 0;

const canInitializeFirebase = () => isBrowser() && isFirebaseConfigured;

const initializeFirebaseApp = (): FirebaseApp | null => {
  if (!canInitializeFirebase()) {
    if (isBrowser() && !isFirebaseConfigured && !missingConfigWarned) {
      missingConfigWarned = true;
      console.info('[WeekCrew] Firebase config is missing. Running in demo mode without Firestore.');
    }
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    initializationError = error;
    console.error('[WeekCrew] Failed to initialize Firebase app.', error);
    firebaseApp = null;
  }

  return firebaseApp;
};

export const getFirebaseApp = (): FirebaseApp | null => initializeFirebaseApp();

export const getFirebaseStatus = (): FirebaseStatus => ({
  configured: isFirebaseConfigured,
  initialized: firebaseApp !== null,
  error: initializationError instanceof Error ? initializationError.message : undefined
});

export const getFirestoreClient = (): Firestore | null => {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  try {
    return getFirestore(app);
  } catch (error) {
    initializationError = error;
    console.error('[WeekCrew] Failed to access Firestore.', error);
    return null;
  }
};

export const getFirebaseAuth = (): Auth | null => {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  try {
    return getAuth(app);
  } catch (error) {
    initializationError = error;
    console.error('[WeekCrew] Failed to access Firebase Auth.', error);
    return null;
  }
};

export const ensureAnonymousAuth = async (): Promise<string | null> => {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.info('[WeekCrew] Skipping anonymous auth because Firebase is disabled.');
    return null;
  }

  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (error) {
    console.warn('[WeekCrew] Anonymous auth failed to start.', error);
    return null;
  }

  return new Promise<string | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          resolve(user.uid);
          unsubscribe();
        }
      },
      (error) => {
        console.warn('[WeekCrew] Anonymous auth listener failed.', error);
        resolve(null);
        unsubscribe();
      }
    );
    setTimeout(() => {
      resolve(auth.currentUser?.uid ?? null);
      unsubscribe();
    }, 5000);
  });
};
