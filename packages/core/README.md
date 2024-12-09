# @whoj/utils-core

<p>
  <a href="https://www.npmjs.com/package/@whoj/utils-core">
    <img src="https://badgen.net/npm/v/@whoj/utils-core?icon=npm&color=green&label=" alt="Version">
  </a>
  <a href="#">
    <img src="https://badgen.net/npm/types/@whoj/utils-core?color=blue&icon=typescript&label=" alt="Typings">
  </a>
  <a href="https://github.com/who-jonson/utils-core/blob/master/LICENSE">
    <img src="https://badgen.net/npm/license/@whoj/utils-core" alt="License">
  </a>
</p>

### Install

<!-- automd:pm-install name="@whoj/utils-core" -->

```sh
# ✨ Auto-detect
npx nypm install @whoj/utils-core

# npm
npm install @whoj/utils-core

# yarn
yarn add @whoj/utils-core

# pnpm
pnpm install @whoj/utils-core

# bun
bun install @whoj/utils-core

# deno
deno install @whoj/utils-core
```

<!-- /automd -->

## Available Functions

### Array

<!-- automd:jsdocs src="./src/array" -->

### `at(array, index)`

### `clampArrayRange(n, arr)`

Clamp a number to the index ranage of an array

### `flattenArrayable(array?)`

Convert `Arrayable<T>` to `Array<T>` and flatten it

### `flattenDeepArray(array?, key?)`

Convert `Arrayable<T>` to `Array<T>` and flatten object's array by key

Example: const payload = [ { child: [{name: 'John Doe'}] }, { child: [ {age: 23} ] } ]; flattenDeepArray(payload, 'child'); Result: [{name: 'John Doe'}, {age: 23}]

### `last(array)`

### `mergeArrayable()`

Use rest arguments to merge arrays

### `move(arr, from, to)`

Move element in an Array

### `partition(array)`

### `range()`

### `remove(array, value)`

Remove an item from Array

### `sample(arr, count)`

Get random items from an array

### `shuffle(array)`

Shuffle an array. This function mutates the array.

### `toArray(array?)`

Convert `Arrayable<T>` to `Array<T>`

### `uniq(array)`

Unique an Array

<!-- /automd -->

### Function

<!-- automd:jsdocs src="./src/func" -->

### `batchInvoke(functions)`

Call every function in an array

### `invoke(fn)`

Call the function

### `tap(val, callback)`

Pass the value through the callback, and return the value

**Example:**

```
function createUser(name: string): User {
  return tap(new User, user => {
    user.name = name
  })
}
```

<!-- /automd -->

### Globals

<!-- automd:jsdocs src="./src/global" -->

### `getDocument()`

If document is defined, return document, otherwise return undefined.

### `getGlobal(prop?)`

If we're on the server, return the global object, otherwise return the window object

### `getWindow()`

If we're on the server, return undefined, otherwise return the window object.

### `isClient()`

If the window object exists, then we're in the browser, otherwise we're in Node.

### `isServer()`

If the type of window is undefined, then we're on the server.

### `scrollToElement(element)`

<!-- /automd -->

### Guard

<!-- automd:jsdocs src="./src/guard" -->

### `isTruthy(v)`

Type guard to filter out falsy values

**Example:**

```ts
array.filter(isTruthy)
```

### `noNull(v)`

Type guard to filter out null values

**Example:**

```ts
array.filter(noNull)
```

### `notNullish(v)`

Type guard to filter out null-ish values

**Example:**

```ts
array.filter(notNullish)
```

### `notUndefined(v)`

Type guard to filter out null-ish values

**Example:**

```ts
array.filter(notUndefined)
```

<!-- /automd -->

### Math

<!-- automd:jsdocs src="./src/math" -->

### `clamp(n, min, max)`

Clamp any number

### `sum()`

Sum any amount of number

<!-- /automd -->

### Object

<!-- automd:jsdocs src="./src/obj" -->

### `clearUndefined(obj)`

Clear undefined fields from an object. It mutates the object

### `deepMerge(target)`

Deep merge :P

### `fromPairs(pairs)`

### `isKeyOf(obj, k)`

Type guard for any key, `k`. Marks `k` as a key of `T` if `k` is in `obj`.

### `objectEntries(obj)`

Strict typed `Object.entries`

### `objectKeys(obj)`

Strict typed `Object.keys`

### `objectMap(obj, fn)`

Map key/value pairs for an object, and construct a new one

**Example:**

```
objectMap({ a: 1, b: 2 }, (k, v) => [k.toString().toUpperCase(), v.toString()])
// { A: '1', B: '2' }
```
Swap key/value:

**Example:**

```
objectMap({ a: 1, b: 2 }, (k, v) => [v, k])
// { 1: 'a', 2: 'b' }
```
Filter keys:

**Example:**

```
objectMap({ a: 1, b: 2 }, (k, v) => k === 'a' ? undefined : [k, v])
// { b: 2 }
```

### `objectPick(obj, keys, omitUndefined)`

Create a new subset object by giving keys

### `toPairs(obj)`

<!-- /automd -->

### Promise

<!-- automd:jsdocs src="./src/promise" -->

### `createControlledPromise()`

Return a Promise with `resolve` and `reject` methods

**Example:**

```
const promise = createControlledPromise()

await promise

// in anther context:
promise.resolve(data)
```

### `createPromiseLock()`

Create a promise lock

**Example:**

```
const lock = createPromiseLock()

lock.run(async () => {
  await doSomething()
})

// in anther context:
await lock.wait() // it will wait all tasking finished
```

### `createSingletonPromise(fn)`

Create singleton promise function

### `parallel(tasks, fn)`

Parallel Promise

### `parallelSafe(tasks, fn)`

Safe Parallel Promise

### `serial(tasks, fn)`

Serial Promise

### `sleep(ms, callback?)`

Promised `setTimeout`

<!-- /automd -->

### String

<!-- automd:jsdocs src="./src/str" -->

### `capitalize()`

### `divideStr(str, separator, position)`

### `ensurePrefix(prefix, str)`

Ensure prefix of a string

### `ensureSuffix(suffix, str)`

Ensure suffix of a string

### `slash(str)`

Replace backslash to slash

### `template(str)`

Dead simple template engine, just like Python's `.format()`

**Example:**

```
const result = template(
  'Hello {0}! My name is {1}.',
  'John',
  'B.'
) // Hello John! My name is B..
```

<!-- /automd -->

### Timer

<!-- automd:jsdocs src="./src/timer" -->

### `stoppableTimeOut(cb, interval)`

### `timestamp()`

Timestamp value

<!-- /automd -->

### Others

<!-- automd:jsdocs src="./src/c" -->

### `assert(condition, message)`

Assert

### `noop()`

Noop

<!-- /automd -->
<!-- automd:jsdocs src="./src/is" -->

### `hasConsole`

- **Type**: `boolean`
- **Default**: `true`

### `isArray(val)`

Check if is Array

### `isBoolean(val)`

Check if value is boolean

### `isBrowser`

- **Type**: `boolean`
- **Default**: `false`

### `isDef(val?)`

### `isFunction(val)`

Check if value is Function

### `isGlobPattern(pattern?, options?)`

Check if it has glob pattern

### `isNumber(val)`

Check if value is Number

### `isNumberish(val)`

Check if value is Numberish

### `isObject(val)`

Check if value is Object

### `isString(val)`

Check if value is String

### `isWindow(val)`

Check if window defined

<!-- /automd -->


[MIT](../../LICENSE) License © 2022 [Jonson B.](https://github.com/who-jonson)
