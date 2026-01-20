import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RefObject } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatWithCommas = (raw: string) => {
  if (!raw) return '';
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(n) ? '' : n.toLocaleString('en-US');
};

export const scrollToSection = (
  ref: RefObject<HTMLElement | null>,
  offset: number = 0,
) => {
  if (ref && ref.current) {
    const y = ref.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};
