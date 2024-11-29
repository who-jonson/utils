/**
 * Assert
 *
 * @param condition -
 * @param message -
 *
 * @__NO_SIDE_EFFECTS__
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
 * @__NO_SIDE_EFFECTS__
 *
 */
export const toString = (val: any) => Object.prototype.toString.call(val);

/**
 * Noop
 *
 * @__NO_SIDE_EFFECTS__
 */
export const noop = () => {};
