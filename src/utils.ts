import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLessonLabel = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'уроков';
  if (lastDigit === 1) return 'урок';
  if (lastDigit >= 2 && lastDigit <= 4) return 'урока';
  return 'уроков';
};