import { unref } from 'vue-demi';
import type { ComputedRefable } from '../types';

/**
 * Get the value of value/ref/getter.
 */
export function unrefOf<T>(r: ComputedRefable<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r);
}
