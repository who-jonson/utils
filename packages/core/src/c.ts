/**
 * Assert
 *
 * @param condition -
 * @param message -
 *
 */
export const assert = (condition: boolean, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

/**
 * Convert to String
 *
 * @param val -
 *
 * @returns - Converted String
 *
 */
export const toString = (val: any) => Object.prototype.toString.call(val);

/**
 * Noop
 */
export const noop = () => {};
