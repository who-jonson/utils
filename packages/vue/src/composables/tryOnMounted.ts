import { getCurrentInstance, nextTick, onMounted } from 'vue-demi';

/**
 * Call onMounted() if it's inside a component lifecycle, if not, just call the function
 *
 * @param func
 * @param sync if set to false, it will run in the nextTick() of Vue
 *
 * @__NO_SIDE_EFFECTS__
 */
export function tryOnMounted<T extends Function>(func: T, sync = true) {
  if (getCurrentInstance()) {
    onMounted(() => func());
  } else if (sync) {
    func();
  } else {
    nextTick(() => func());
  }
}
