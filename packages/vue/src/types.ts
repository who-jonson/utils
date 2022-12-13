import type { ComputedRef, Ref } from 'vue-demi';

/**
 * Maybe it's a ref, or a plain value
 *
 * ```ts
 * type Refable<T> = T | Ref<T>
 * ```
 */
export type Refable<T> = T | Ref<T>;

/**
 * Maybe it's a computed ref, or a getter function
 *
 * ```ts
 * type ReadonlyRefable<T> = (() => T) | ComputedRef<T>
 * ```
 */
export type ReadonlyRefable<T> = (() => T) | ComputedRef<T>;

/**
 * Maybe it's a ref, or a plain value, or a getter function
 *
 * ```ts
 * type ComputedRefable<T> = (() => T) | T | Ref<T> | ComputedRef<T>
 * ```
 */
export type ComputedRefable<T> = ReadonlyRefable<T> | Refable<T>;
