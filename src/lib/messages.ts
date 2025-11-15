import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import type { Message } from '@/types';
import { getFirestoreClient } from '@/config/firebase';

const messagesCollection = () => collection(getFirestoreClient(), 'messages');

const mapMessage = (snapshot: any): Message => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    circleId: data.circleId,
    authorId: data.authorId,
    authorAlias: data.authorAlias,
    content: data.content,
    type: data.type ?? 'text',
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt
  };
};

export const listenToCircleMessages = (
  circleId: string,
  onUpdate: (messages: Message[]) => void
) => {
  const q = query(
    messagesCollection(),
    where('circleId', '==', circleId),
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(mapMessage);
    onUpdate(messages);
  });
};

export const sendMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
  await addDoc(messagesCollection(), {
    ...message,
    createdAt: serverTimestamp()
  });
};
