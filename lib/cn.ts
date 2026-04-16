import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Our Tailwind config adds custom font-size utilities
 * (text-display / text-h1..h3 / text-body / text-small / text-micro).
 *
 * Out of the box tailwind-merge treats any `text-*` utility as part of
 * the generic "text" classifier, which causes it to dedupe against
 * text-color utilities (text-white, text-brand-primary, …). That silently
 * drops `text-white` from Button primary when combined with the size's
 * `text-body` and produces dark text on a dark-blue background.
 *
 * Register the custom font-sizes explicitly so tailwind-merge keeps
 * color and size utilities in separate groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: ['display', 'h1', 'h2', 'h3', 'body', 'small', 'micro'],
        },
      ],
    },
  },
});

/**
 * Combine conditional classnames + resolve conflicting Tailwind utilities.
 * Keeps components terse and merge-aware.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
