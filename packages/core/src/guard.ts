/**
 * Type guard to filter out null-ish values
 *
 * @category Guards
 * @example array.filter(notNullish)
 *
 * @__NO_SIDE_EFFECTS__
 */
export function notNullish<T>(v: T | null | undefined): v is NonNullable<T> {
  return v != null;
}

/**
 * Type guard to filter out null values
 *
 * @category Guards
 * @example array.filter(noNull)
 *
 * @__NO_SIDE_EFFECTS__
 */
export function noNull<T>(v: T | null): v is Exclude<T, null> {
  return v !== null;
}

/**
 * Type guard to filter out null-ish values
 *
 * @category Guards
 * @example array.filter(notUndefined)
 *
 * @__NO_SIDE_EFFECTS__
 */
export function notUndefined<T>(v: T): v is Exclude<T, undefined> {
  return v !== undefined;
}

/**
 * Type guard to filter out falsy values
 *
 * @category Guards
 * @example array.filter(isTruthy)
 *
 * @__NO_SIDE_EFFECTS__
 */
export function isTruthy<T>(v: T): v is NonNullable<T> {
  return Boolean(v);
}
