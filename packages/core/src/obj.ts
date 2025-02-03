import type { List, DeepMerge, Dictionary } from '@whoj/utils-types';
import { isObject } from './is';
import { notNullish } from './guard';

/**
 * Map key/value pairs for an object, and construct a new one
 *
 *
 * @category Object
 *
 * Transform:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [k.toString().toUpperCase(), v.toString()])
 * // { A: '1', B: '2' }
 * ```
 *
 * Swap key/value:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [v, k])
 * // { 1: 'a', 2: 'b' }
 * ```
 *
 * Filter keys:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => k === 'a' ? undefined : [k, v])
 * // { b: 2 }
 * ```
 *
 * @__NO_SIDE_EFFECTS__
 */
export function objectMap<K extends string, V, NK = K, NV = V>(obj: Record<K, V>, fn: (key: K, value: V) => [NK, NV] | undefined): Record<K, V> {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => fn(k as K, v as V))
      .filter(notNullish)
  );
}

/**
 * Type guard for any key, `k`.
 * Marks `k` as a key of `T` if `k` is in `obj`.
 *
 * @category Object
 *
 * @param obj object to query for key `k`
 * @param k key to check existence in `obj`
 *
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function isKeyOf<T extends object>(obj: T, k: keyof any): k is keyof T {
  return k in obj;
}

/**
 * Strict typed `Object.keys`
 *
 * @category Object
 *
 * @param obj
 *
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function objectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Strict typed `Object.entries`
 *
 * @category Object
 *
 * @param obj
 *
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function objectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Deep merge :P
 *
 * @category Object
 *
 * @param target
 * @param sources
 *
 * @typeParam T
 * @typeParam S
 *
 * @__NO_SIDE_EFFECTS__
 */
export function deepMerge<T extends object = object, S extends object = T>(target: T, ...sources: S[]): DeepMerge<T, S> {
  if (!sources.length) {
    return target as any;
  }

  const source = sources.shift();
  if (source === undefined) {
    return target as any;
  }

  if (isObjectMergable(target) && isObjectMergable(source)) {
    objectKeys(source).forEach((key) => {
      if (isObjectMergable(source[key])) {
        // @ts-ignore
        if (!target[key]) {
          // @ts-ignore
          target[key] = {};
        }
        // @ts-ignore
        deepMerge(target[key], source[key]);
      }
      else {
        // @ts-ignore
        target[key] = source[key];
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if mergable object
 *
 * @category Object
 *
 * @param item
 *
 * @__NO_SIDE_EFFECTS__
 */
function isObjectMergable(item: any): item is object {
  return isObject(item) && !Array.isArray(item);
}

/**
 * Create a new subset object by giving keys
 *
 * @category Object
 *
 * @param obj
 * @param keys
 * @param omitUndefined
 *
 * @typeParam O
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function objectPick<O extends object, T extends keyof O>(obj: O, keys: T[], omitUndefined = false) {
  return keys.reduce((n, k) => {
    if (k in obj) {
      if (!omitUndefined || obj[k] !== undefined) {
        n[k] = obj[k];
      }
    }
    return n;
  }, {} as Pick<O, T>);
}

/**
 * Clear undefined fields from an object. It mutates the object
 *
 * @category Object
 *
 * @param obj
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function clearUndefined<T extends object>(obj: T): T {
  Object.keys(obj).forEach((key: string) => (obj[key] === undefined ? delete obj[key] : {}));
  return obj;
}

/**
 * Determines whether an object has a property with the specified name
 *
 * @category Object
 *
 * @param obj
 * @param key
 * @typeParam T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function hasOwnProperty<T>(obj: T, key: PropertyKey) {
  if (obj == null) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 *
 * @category Object
 *
 * @typeParam T
 * @param {Array} pairs
 *
 * @__NO_SIDE_EFFECTS__
 */
export function fromPairs<T>(pairs: List<[PropertyKey, T]>) {
  return pairs.reduce<Dictionary<T>>((obj, [key, val]) => ({
    ...obj,
    [key]: val
  }), {});
}

/**
 *
 * @category Object
 *
 * @typeParam T
 *
 * @param {Dictionary} obj
 * @returns {Array}
 *
 * @__NO_SIDE_EFFECTS__
 */
export function toPairs<T>(obj: Dictionary<T>) {
  return objectEntries(obj);
}
