import type { Func } from '@whoj/utils-types';

import { onScopeDispose, getCurrentScope } from 'vue-demi';

/**
 * Call onScopeDispose() if it's inside a effect scope lifecycle, if not, do nothing
 *
 * @param {Func} func
 *
 * @__NO_SIDE_EFFECTS__
 */
export function tryOnScopeDispose(func: Func) {
  if (getCurrentScope()) {
    onScopeDispose(func);
    return true;
  }
  return false;
}
