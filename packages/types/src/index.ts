export {};
/**
 * Boolean or 'true' or 'false'
 *
 * @category Type Alias
 */
export type Booleanish = boolean | 'true' | 'false';

/**
 * Number or String (Numeric)
 *
 * @category Type Alias
 */
export type Numberish = number | string;
/**
 * Promise, or maybe not
 *
 * @category Type Alias
 *
 * @typeParam D - Type of data the Promise return
 */
export type Awaitable<T> = T | PromiseLike<T>;

/**
 * Null or whatever
 *
 * @category Type Alias
 *
 * @typeParam D - Type of data which is nullable
 */
export type Nullable<T> = T | null | undefined;

/**
 * Array, or not yet
 *
 * @category Type Alias
 *
 * @typeParam D - Type of data which can be arrayed
 */
export type Arrayable<T> = T | Array<T>;

/**
 * Function
 *
 * @category Type Alias
 *
 * @typeParam D - Type of data the Function return
 */
export type Func<T = void, D = T> = (args: T) => D;

/**
 * Infers the element type of array
 *
 * @category Type Alias
 *
 * @typeParam D - Type of object which element is
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never;

/**
 * Infers the arguments type of function
 *
 * @category Type Alias
 *
 * @typeParam D - Type of Function for the arguments
 */
export type ArgumentsType<T> = T extends ((...args: infer A) => any) ? A : never;

/**
 * Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
 *
 * @category Type Alias
 */
export type Class<T, Arguments extends unknown[] = any[]> = Constructor<T, Arguments> & { prototype: T };

/**
 * Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
 *
 * @category Type Alias
 */
export type Constructor<T, Arguments extends unknown[] = any[]> = new(...arguments_: Arguments) => T;

/**
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.
 *
 * @category Type Alias
 */
export type JsonObject = { [Key in string]?: JsonValue };

/**
 * Matches a JSON array.
 *
 * @category Type Alias
 */
export type JsonArray = JsonValue[];

/**
 * Matches any valid JSON primitive value.
 *
 * @category Type Alias
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Matches any valid JSON value.
 *
 * @category Type Alias
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Merging
 *
 * @category Type Alias
 */
export type MergeInsertions<T> =
  T extends object
    ? { [K in keyof T]: MergeInsertions<T[K]> }
    : T;

/**
 * Very Deep Merging
 *
 * @category Type Alias
 */
export type DeepMerge<F, S> = MergeInsertions<{
  [K in keyof F | keyof S]: K extends keyof S & keyof F
    ? DeepMerge<F[K], S[K]>
    : K extends keyof S
      ? S[K]
      : K extends keyof F
        ? F[K]
        : never;
}>;

/**
 * Very Deep Merging
 *
 * @category Type Alias
 */
export type NestedKeyOf<Obj extends object> =
  {[Key in keyof Obj & (string | number)]: Obj[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<Obj[Key]>}` : `${Key}`
  }[keyof Obj & (string | number)];

/**
 * Alias for NestedKeyOf
 *
 * @category Type Alias
 */
export type ObjectPaths<Obj extends object> = NestedKeyOf<Obj>;

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type List<T> = Array<T>;
export interface Dictionary<T> {
  [index: PropertyKey]: T;
}
