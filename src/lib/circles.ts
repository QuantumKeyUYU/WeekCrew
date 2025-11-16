import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  Timestamp,
  where,
  type Firestore
} from 'firebase/firestore';
import { addDays } from 'date-fns';
import type { Circle, InterestTag } from '@/types';
import { INTERESTS } from '@/constants/interests';
import { getFirestoreClient } from '@/config/firebase';
import { copy, type Locale } from '@/i18n/copy';

const CIRCLES_COLLECTION = 'circles';
const DEFAULT_CAPACITY = 8;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const getDbOrThrow = (locale: Locale = 'ru'): Firestore => {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error(copy[locale]?.error_firebase_disabled_circles ?? copy.ru.error_firebase_disabled_circles);
  }
  return db;
};

const circlesCollection = (db: Firestore) => collection(db, CIRCLES_COLLECTION);

const resolveTitle = (interest: InterestTag) => {
  const match = INTERESTS.find((item) => item.id === interest);
  if (!match) {
    return copy.ru.circle_header_default_title;
  }
  return copy.ru[match.labelKey] ?? copy.ru.circle_header_default_title;
};

const ensureTimestamp = (value: any, fallback: Timestamp): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value && typeof value.toDate === 'function') {
    return Timestamp.fromDate(value.toDate());
  }
  if (
    value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  ) {
    return new Timestamp(value.seconds, value.nanoseconds);
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  if (typeof value === 'number') {
    return Timestamp.fromMillis(value);
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return Timestamp.fromMillis(parsed);
    }
  }
  return fallback;
};

const mapCircle = (id: string, data: any): Circle => {
  const now = Timestamp.now();
  const defaultExpiry = Timestamp.fromDate(addDays(now.toDate(), 7));
  return {
    id,
    interest: data.interest as InterestTag,
    title: data.title ?? resolveTitle(data.interest as InterestTag),
    status: (data.status ?? 'active') as Circle['status'],
    capacity: data.capacity ?? DEFAULT_CAPACITY,
    memberIds: Array.isArray(data.memberIds)
      ? data.memberIds.filter((id: unknown): id is string => typeof id === 'string')
      : [],
    createdAt: ensureTimestamp(data.createdAt, now),
    expiresAt: ensureTimestamp(data.expiresAt, defaultExpiry),
    icebreakerSeed: data.icebreakerSeed ?? undefined
  };
};

const createCircleDoc = async (db: Firestore, interest: InterestTag, deviceId: string) => {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 7 * MS_IN_DAY);
  const payload = {
    interest,
    title: resolveTitle(interest),
    status: 'active' as const,
    capacity: DEFAULT_CAPACITY,
    memberIds: [deviceId],
    createdAt: now,
    expiresAt,
    icebreakerSeed: `${interest}-${Math.random().toString(36).slice(2, 8)}`
  };
  const ref = await addDoc(circlesCollection(db), payload);
  const snapshot = await getDoc(ref);
  return mapCircle(snapshot.id, snapshot.data());
};

const tryJoinCircle = async (db: Firestore, circleId: string, deviceId: string): Promise<Circle | null> => {
  const ref = doc(db, CIRCLES_COLLECTION, circleId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      return null;
    }
    const data = snapshot.data();
    const memberIds: string[] = Array.isArray(data.memberIds) ? data.memberIds : [];
    const capacity: number = data.capacity ?? DEFAULT_CAPACITY;

    if (memberIds.includes(deviceId)) {
      return mapCircle(snapshot.id, data);
    }
    if (memberIds.length >= capacity || data.status === 'archived') {
      return null;
    }

    const updatedMemberIds = [...memberIds, deviceId];
    transaction.update(ref, { memberIds: updatedMemberIds });
    return mapCircle(snapshot.id, { ...data, memberIds: updatedMemberIds });
  }).catch(() => null);
};

const findJoinableCircle = async (
  db: Firestore,
  interest: InterestTag,
  deviceId: string
): Promise<Circle | null> => {
  const q = query(
    circlesCollection(db),
    where('interest', '==', interest),
    where('status', '==', 'active'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const memberIds: string[] = Array.isArray(data.memberIds) ? data.memberIds : [];
    const capacity: number = data.capacity ?? DEFAULT_CAPACITY;
    if (memberIds.includes(deviceId)) {
      return mapCircle(docSnap.id, data);
    }
    if (memberIds.length < capacity) {
      const joined = await tryJoinCircle(db, docSnap.id, deviceId);
      if (joined) {
        return joined;
      }
    }
  }

  return null;
};

export const joinOrCreateCircle = async (interest: InterestTag, deviceId: string, options?: { locale?: Locale }) => {
  const locale = options?.locale ?? 'ru';
  const db = getDbOrThrow(locale);
  const existing = await findJoinableCircle(db, interest, deviceId);
  if (existing) {
    return existing;
  }
  return createCircleDoc(db, interest, deviceId);
};

export const getCircleById = async (circleId: string): Promise<Circle | null> => {
  const db = getFirestoreClient();
  if (!db) {
    console.info('[WeekCrew] Skipping circle fetch because Firebase is disabled.');
    return null;
  }
  const ref = doc(db, CIRCLES_COLLECTION, circleId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return null;
  }
  return mapCircle(snapshot.id, snapshot.data());
};

export const isCircleExpired = (circle: Circle) => {
  const expiresAt = circle.expiresAt?.toMillis?.();
  if (typeof expiresAt !== 'number') {
    return circle.status === 'archived';
  }
  return Date.now() >= expiresAt || circle.status === 'archived';
};

export const CIRCLE_DEFAULT_CAPACITY = DEFAULT_CAPACITY;
