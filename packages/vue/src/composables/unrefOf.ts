import { unref } from 'vue-demi';

import type { ComputedRefable } from '../types';

/**
 * Get the value of value/ref/getter.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function unrefOf<T>(r: ComputedRefable<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r);
}
