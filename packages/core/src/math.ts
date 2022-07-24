import { flattenArrayable } from './array';

/**
 * Clamp any number
 *
 * @param n - Number for clamp
 * @param min - Starting Number for clamp range
 * @param max - Ending Number for clamp range
 *
 * @returns The clamped value of given `n`
 */
export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Sum any amount of number
 *
 * @param args - Numbers you need to sum
 *
 * @returns The summation of given `args`
 */
export function sum(...args: number[] | number[][]) {
  return flattenArrayable(args).reduce((a, b) => a + b, 0);
}
