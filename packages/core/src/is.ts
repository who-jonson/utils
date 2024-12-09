import * as isGlob from 'is-glob';
import { toString } from './c';

/**
 * @category Is Type
 *
 * @param val
 * @typeParam T
 *
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined';

/**
 * Check if value is boolean
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean';

/**
 * Check if value is Function
 * @category Is Type
 *
 * @param val
 * @typeParam T
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isFunction = <T extends Function> (val: any): val is T => typeof val === 'function';

/**
 * Check if value is Number
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isNumber = (val: any): val is number => typeof val === 'number';
/**
 * Check if value is Numberish
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isNumberish = (val: any): val is number => typeof val === 'number' || !isNaN(val);

/**
 * Check if value is String
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isString = (val: unknown): val is string => typeof val === 'string';

/**
 * Check if value is Object
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isObject = <T extends object>(val: any): val is T => toString(val) === '[object Object]';

/**
 * Check if is Array
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isArray = <T = any>(val: any): val is Array<T> => Array.isArray(val);

/**
 * Check if window defined
 * @category Is Type
 *
 * @param val
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isWindow = (val: any): boolean => typeof window !== 'undefined' && toString(val) === '[object Window]';

/**
 * Check if in Browser
 * @category Is Type
 *
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isBrowser = (() => typeof window !== 'undefined')();

/**
 * Check if it has console
 * @category Is Type
 *
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const hasConsole = (() => typeof console !== 'undefined')();

/**
 * Check if it has glob pattern
 * @category Is Glob
 *
 * @returns - Boolean
 *
 * @__NO_SIDE_EFFECTS__
 */
export const isGlobPattern = (pattern?: string | string[] | null, options?: isGlob.Options) => isGlob(pattern, options);
