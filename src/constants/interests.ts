import type { InterestTag } from '@/types';

export const INTERESTS: { id: InterestTag; label: string; description: string }[] = [
  { id: 'kpop', label: 'K-pop', description: 'фандомы, камбеки и любимые лайтовые треки' },
  { id: 'anime', label: 'Аниме', description: 'сезонные премьеры, классика и манга' },
  { id: 'drama', label: 'Дорамы', description: 'кей и чжи дорамы, обсуждения свежих серий' },
  { id: 'psychology', label: 'Психология', description: 'лайтовая психология и забота о себе' },
  { id: 'books', label: 'Книги', description: 'рекомендуем, обсуждаем и вдохновляемся' },
  { id: 'music', label: 'Музыка', description: 'от инди до поп-хитов, делимся плейлистами' },
  { id: 'it', label: 'IT', description: 'продукт, код, дизайн и всё между' },
  { id: 'games', label: 'Игры', description: 'инди, AAA и уютные фермы' },
  { id: 'movies', label: 'Кино', description: 'премьеры, любимые режиссёры и кадры' },
  { id: 'custom', label: 'Сюрприз', description: 'дай системе подобрать тебе что-то новое' }
];

export const DEFAULT_ICEBREAKERS = [
  'Скинь любимый трек недели',
  'Какой мем тебя спасал в последний раз?',
  'Поделись чем-то, что радует сегодня',
  'Какой вопрос ты бы задал новичку в теме?',
  'Расскажи про свой маленький ритуал радости',
  'Что зацепило тебя за неделю?',
  'Какую идею хочешь попробовать на следующей неделе?'
];
