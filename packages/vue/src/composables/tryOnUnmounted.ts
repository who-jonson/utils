import type { Func } from '@whoj/utils-types';
import { onUnmounted, getCurrentInstance } from 'vue-demi';

/**
 * Call onUnmounted() if it's inside a component lifecycle, if not, do nothing
 *
 * @param func
 *
 * @__NO_SIDE_EFFECTS__
 */
export function tryOnUnmounted(func: Func) {
  if (getCurrentInstance()) {
    onUnmounted(func);
  }
}
