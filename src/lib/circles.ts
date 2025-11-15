import {
  addDoc,
  collection,
  doc,
  increment,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { formatISO, addDays } from 'date-fns';
import type { Circle, InterestTag } from '@/types';
import { DEFAULT_ICEBREAKERS } from '@/constants/interests';
import { getFirestoreClient } from '@/config/firebase';

const circlesCollection = () => collection(getFirestoreClient(), 'circles');

const mapCircle = (id: string, data: any): Circle => ({
  id,
  interest: data.interest,
  title: data.title,
  description: data.description ?? '',
  weekStart: data.weekStart,
  participantLimit: data.participantLimit,
  participantCount: data.participantCount ?? 0,
  isActive: data.isActive ?? true,
  icebreakers: data.icebreakers ?? DEFAULT_ICEBREAKERS,
  currentIcebreakerIndex: data.currentIcebreakerIndex ?? 0,
  expiresAt: data.expiresAt ?? formatISO(addDays(new Date(data.weekStart), 7))
});

export const fetchActiveCircleByInterest = async (interest: InterestTag): Promise<Circle | null> => {
  const q = query(
    circlesCollection(),
    where('interest', '==', interest),
    where('isActive', '==', true),
    orderBy('participantCount', 'asc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const docSnap = snapshot.docs[0];
  const circle = mapCircle(docSnap.id, docSnap.data());
  if (circle.participantCount >= circle.participantLimit) {
    return null;
  }
  return circle;
};

export const createCircle = async (interest: InterestTag): Promise<Circle> => {
  const now = new Date();
  const payload = {
    interest,
    title: `Неделя ${interest.toUpperCase()}`,
    description: 'Новый кружок недели от WeekCrew',
    weekStart: formatISO(now, { representation: 'date' }),
    participantLimit: 8,
    participantCount: 0,
    isActive: true,
    icebreakers: DEFAULT_ICEBREAKERS,
    currentIcebreakerIndex: 0,
    expiresAt: formatISO(addDays(now, 7)),
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(circlesCollection(), payload);
  const docSnap = await getDoc(ref);
  return mapCircle(ref.id, docSnap.data());
};

export const incrementParticipantCount = async (circleId: string) => {
  const ref = doc(getFirestoreClient(), 'circles', circleId);
  await updateDoc(ref, {
    participantCount: increment(1)
  });
};

export const archiveCircle = async (circleId: string) => {
  const ref = doc(getFirestoreClient(), 'circles', circleId);
  await updateDoc(ref, {
    isActive: false
  });
};

export const joinCircle = async (circle: Circle, _userId: string) => {
  await incrementParticipantCount(circle.id);
  return circle;
};

export const getCircleById = async (circleId: string): Promise<Circle | null> => {
  const ref = doc(getFirestoreClient(), 'circles', circleId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return null;
  }
  return mapCircle(snapshot.id, snapshot.data());
};
