import type { Func } from '@whoj/utils-types';

const cacheStringFunction = (fn: Func<string>): Func<string> => {
  const cache = Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};

/**
 * Replace backslash to slash
 *
 * @category String
 */
export function slash(str: string) {
  return str.replace(/\\/g, '/');
}

/**
 * Replace backslash to slash
 *
 * @category String
 * @param {string} str
 *
 * @returns {string}
 */
export const capitalize = cacheStringFunction(str => str.charAt(0).toUpperCase() + str.slice(1));

/**
 * Ensure prefix of a string
 *
 * @category String
 */
export function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix)) {
    return prefix + str;
  }
  return str;
}

/**
 * Ensure suffix of a string
 *
 * @category String
 */
export function ensureSuffix(suffix: string, str: string) {
  if (!str.endsWith(suffix)) {
    return str + suffix;
  }
  return str;
}

/**
 * Dead simple template engine, just like Python's `.format()`
 *
 * @category String
 * @example
 * ```
 * const result = template(
 *   'Hello {0}! My name is {1}.',
 *   'John',
 *   'B.'
 * ) // Hello John! My name is B..
 * ```
 */
export function template(str: string, ...args: any[]): string {
  return str.replace(/{(\d+)}/g, (match, key) => {
    const index = Number(key);
    if (Number.isNaN(index)) {
      return match;
    }
    return args[index];
  });
}

/**
 * @category String
 * Divide a string into 2 parts by char(s)
 * You may define a position if string includes the separator multiple times
 * @param {string} str - The string to be divided.
 * @param {string} separator - The separator to use to divide the string.
 * @param {number} [position=1] - The position of the separator.
 *
 * It will make 2nd item for the return as empty string, if no separator found!
 * @returns string[]
 */
export function divideStr(str: string, separator: string, position = 1) {
  if (str.includes(separator)) {
    const arr = str.split(separator);

    return [
      arr.slice(0, position).join(separator),
      arr.slice(position).join(separator)
    ];
  }
  return [str, ''];
}
