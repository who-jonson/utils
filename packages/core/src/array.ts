import type { Arrayable, Nullable } from '@whoj/utils-types';
import { hasOwnProperty } from './obj';
import { clamp } from './math';

/**
 * Convert `Arrayable<T>` to `Array<T>`
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T> {
  array = array || [];
  if (Array.isArray(array)) {
    return array;
  }
  return [array];
}

/**
 * Convert `Arrayable<T>` to `Array<T>` and flatten it
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function flattenArrayable<T>(array?: Nullable<Arrayable<T | Array<T>>>): Array<T> {
  return toArray(array).flat(1) as Array<T>;
}

/**
 * Use rest arguments to merge arrays
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function mergeArrayable<T>(...args: Nullable<Arrayable<T>>[]): Array<T> {
  return args.flatMap(i => toArray(i));
}

export type PartitionFilter<T> = (i: T, idx: number, arr: readonly T[]) => any;

/**
 * Divide an array into two parts by a filter function
 *
 * @category Array
 * @example const [odd, even] = partition([1, 2, 3, 4], i => i % 2 != 0)
 *
 * @__NO_SIDE_EFFECTS__
 */
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>): [T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>): [T[], T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>): [T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>): [T[], T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>, f5: PartitionFilter<T>): [T[], T[], T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>, f5: PartitionFilter<T>, f6: PartitionFilter<T>): [T[], T[], T[], T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], ...filters: PartitionFilter<T>[]): any {
  const result: T[][] = new Array(filters.length + 1).fill(null).map(() => []);

  array.forEach((e, idx, arr) => {
    let i = 0;
    for (const filter of filters) {
      if (filter(e, idx, arr)) {
        result[i].push(e);
        return;
      }
      i += 1;
    }
    result[i].push(e);
  });
  return result;
}

/**
 * Unique an Array
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function uniq<T>(array: readonly T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Get last item
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function last(array: readonly []): undefined;
export function last<T>(array: readonly T[]): T;
export function last<T>(array: readonly T[]): T | undefined {
  return at(array, -1);
}

/**
 * Remove an item from Array
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function remove<T>(array: T[], value: T) {
  if (!array) {
    return false;
  }
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Get nth item of Array. Negative for backward
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function at(array: readonly [], index: number): undefined;
export function at<T>(array: readonly T[], index: number): T;
export function at<T>(array: readonly T[] | [], index: number): T | undefined {
  const len = array.length;
  if (!len) {
    return undefined;
  }

  if (index < 0) {
    index += len;
  }

  return array[index];
}

/**
 * Generate a range array of numbers. The `stop` is exclusive.
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function range(stop: number): number[];
export function range(start: number, stop: number, step?: number): number[];
export function range(...args: any): number[] {
  let start: number, stop: number, step: number;

  if (args.length === 1) {
    start = 0;
    step = 1;
    ([stop] = args);
  } else {
    ([start, stop, step = 1] = args);
  }

  const arr: number[] = [];
  let current = start;
  while (current < stop) {
    arr.push(current);
    current += step || 1;
  }

  return arr;
}

/**
 * Move element in an Array
 *
 * @category Array
 * @param arr
 * @param from
 * @param to
 *
 * @__NO_SIDE_EFFECTS__
 */
export function move<T>(arr: T[], from: number, to: number) {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  return arr;
}

/**
 * Clamp a number to the index ranage of an array
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function clampArrayRange(n: number, arr: readonly unknown[]) {
  return clamp(n, 0, arr.length - 1);
}

/**
 * Get random items from an array
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function sample<T>(arr: T[], count: number) {
  return Array.from({ length: count }, _ => arr[Math.round(Math.random() * (arr.length - 1))]);
}

/**
 * Shuffle an array. This function mutates the array.
 *
 * @category Array
 *
 * @__NO_SIDE_EFFECTS__
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Convert `Arrayable<T>` to `Array<T>` and flatten object's array by key
 *
 * Example:
 * const payload = [ { child: [{name: 'John Doe'}] }, { child: [ {age: 23} ] } ];
 * flattenDeepArray(payload, 'child');
 * Result: [{name: 'John Doe'}, {age: 23}]
 *
 * @param array
 * @type T extends object
 *
 * @param key
 * @type K extends keyof T
 *
 * @__NO_SIDE_EFFECTS__
 */
export function flattenDeepArray<T extends object, K extends keyof T>(
  array?: Nullable<Arrayable<T | Array<T>>>,
  key?: K
): any {
  const fArray: any[] = [];

  const _myArray = toArray(array);
  if (!key) {
    return _myArray;
  }

  diveDeepArray<T>(
    _myArray as T[],
    'children',
    (a) => {
      fArray.push(a);
    });
  return fArray;
}
/**
 *
 * Traverse through the nested array by key and call a callback with provided parameters.
 * Example
 * const payload = [ { child: [{name: 'John Doe'}] }, { child: [ {age: 23} ] } ];
 * diveDeepArray(payload, 'child',
 *    (a) => {
 *       console.log(a);
 *     }
 *  );
 *
 * Result:
 * {name: 'John Doe'}
 * {age: 23}
 *
 *
 * @param arr
 * @type T extends object = any
 * @param key
 * @type K extends string = string
 * @param callback
 * @type (cd: T, Key: K) => void
 *
 * @__NO_SIDE_EFFECTS__
 */
function diveDeepArray<T extends object = any, K extends string = string>(arr: T[], key: K, callback: (cd: T, key: K) => void) {
  arr.forEach((child: any) => {
    if (hasOwnProperty(child, key) && Array.isArray(child[key])) {
      diveDeepArray<T, K>(child[key], key, callback);
    } else {
      callback(child, key);
    }
  });
}
