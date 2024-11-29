import type { Func, Nullable } from '@whoj/utils-types';

/**
 * Call every function in an array
 *
 * @category Function
 *
 * @param functions
 *
 * @__NO_SIDE_EFFECTS__
 */
export function batchInvoke(functions: Nullable<Func>[]) {
  functions.forEach(fn => fn && fn());
}

/**
 * Call the function
 *
 * @category Function
 *
 * @param fn
 *
 * @__NO_SIDE_EFFECTS__
 */
export function invoke(fn: Func) {
  return fn();
}

/**
 * Pass the value through the callback, and return the value
 *
 * @category Function
 *
 * @param val
 * @param callback
 *
 * @typeParam T
 * @typeParam D
 *
 * @example
 * ```
 * function createUser(name: string): User {
 *   return tap(new User, user => {
 *     user.name = name
 *   })
 * }
 * ```
 *
 * @__NO_SIDE_EFFECTS__
 */
export function tap<T, D = T>(val: T, callback: (val: T) => D): D {
  return callback(val);
}
