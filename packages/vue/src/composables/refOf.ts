import type { Ref, ComputedRef } from 'vue-demi';

import { ref, computed } from 'vue-demi';

import type { Refable, ComputedRefable } from '../types';

/**
 * Get value/ref/getter as `ref` or `computed`.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function refOf<T>(r: T): Ref<T>;
export function refOf<T>(r: Refable<T>): Ref<T>;
export function refOf<T>(r: ComputedRefable<T>): ComputedRef<T>;
export function refOf<T>(r: ComputedRefable<T>) {
  return typeof r === 'function'
    ? computed<T>(r as any)
    : ref(r);
}
