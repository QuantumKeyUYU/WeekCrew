import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import type { CircleMessage } from '@/types';
import { getFirestoreClient } from '@/config/firebase';

const MESSAGES_COLLECTION = 'messages';
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const messagesCollection = () => collection(getFirestoreClient(), MESSAGES_COLLECTION);

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

const mapMessage = (snapshot: any): CircleMessage => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    circleId: data.circleId,
    authorDeviceId: data.authorDeviceId,
    text: data.text,
    createdAt: ensureTimestamp(data.createdAt, Timestamp.now()),
    authorAlias: data.authorAlias
  };
};

export const listenToCircleMessages = (
  circleId: string,
  // eslint-disable-next-line no-unused-vars
  onUpdate: (messages: CircleMessage[]) => void
) => {
  const q = query(
    messagesCollection(),
    where('circleId', '==', circleId),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  return onSnapshot(q, (snapshot) => {
    const nextMessages = snapshot.docs.map(mapMessage);
    onUpdate(nextMessages);
  });
};

export const sendMessage = async (message: {
  circleId: string;
  authorDeviceId: string;
  text: string;
  authorAlias?: string;
}) => {
  await addDoc(messagesCollection(), {
    ...message,
    createdAt: serverTimestamp()
  });
};

export const getAuthorMessageCountInLast24h = async (circleId: string, authorDeviceId: string) => {
  const since = Timestamp.fromMillis(Date.now() - MS_IN_DAY);
  const q = query(
    messagesCollection(),
    where('circleId', '==', circleId),
    where('authorDeviceId', '==', authorDeviceId),
    where('createdAt', '>=', since)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};
