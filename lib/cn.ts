import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine conditional classnames + resolve conflicting Tailwind utilities.
 * Keeps components terse and merge-aware.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
