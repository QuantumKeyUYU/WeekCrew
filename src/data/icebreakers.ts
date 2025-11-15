import { format } from 'date-fns';

export const ICEBREAKERS = [
  { id: 'music-1', text: 'Какой трек у тебя сегодня саундтрек дня?' },
  { id: 'life-1', text: 'Что маленькое порадовало тебя за последние 24 часа?' },
  { id: 'food-1', text: 'Что бы ты сейчас с удовольствием поел или приготовил?' },
  { id: 'dream-1', text: 'Какая маленькая мечта ждёт своей очереди?' },
  { id: 'learn-1', text: 'Чему новому ты научился(ась) на этой неделе?' },
  { id: 'calm-1', text: 'Что помогает тебе расслабляться вечером?' },
  { id: 'story-1', text: 'Расскажи историю, которая всё ещё вызывает улыбку.' },
  { id: 'gratitude-1', text: 'За что ты благодарен(на) сегодняшнему дню?' },
  { id: 'mood-1', text: 'В каком настроении ты сегодня и почему?' },
  { id: 'idea-1', text: 'Какая идея не выходит у тебя из головы прямо сейчас?' }
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
};

export const getIcebreakerForCircle = (circleId: string, date: Date | string, seed?: string) => {
  const dayKey = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const base = `${circleId}-${seed ?? ''}-${dayKey}`;
  const index = hashString(base) % ICEBREAKERS.length;
  return ICEBREAKERS[index];
};
