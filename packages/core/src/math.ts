import { flattenArrayable } from '.';

/**
 * Clamp any number
 *
 * @param n - Number for clamp
 * @param min - Starting Number for clamp range
 * @param max - Ending Number for clamp range
 *
 * @returns The clamped value of given `n`
 *
 * @__NO_SIDE_EFFECTS__
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
 *
 * @__NO_SIDE_EFFECTS__
 */
export function sum(...args: number[] | number[][]) {
  return flattenArrayable<number>(args).reduce((a, b) => a + b, 0);
}
