import type { Func } from '@whoj/utils-types';
import { getCurrentInstance, onUnmounted } from 'vue-demi';

/**
 * Call onUnmounted() if it's inside a component lifecycle, if not, do nothing
 *
 * @param func
 */
export function tryOnUnmounted(func: Func) {
  if (getCurrentInstance()) {
    onUnmounted(func);
  }
}
