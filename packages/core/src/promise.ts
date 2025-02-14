import type { Func } from '@whoj/utils-types';

import { remove } from './array';

/**
 * @category Interface
 */
export interface SingletonPromiseReturn<T> {
  (): Promise<T>;
  /**
   * Reset current staled promise.
   * Await it to have proper shutdown.
   */
  reset: () => Promise<void>;
}

/**
 * Create singleton promise function
 *
 * @category Promise
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createSingletonPromise<T>(fn: () => Promise<T>): SingletonPromiseReturn<T> {
  let _promise: undefined | Promise<T>;

  function wrapper() {
    if (!_promise) {
      _promise = fn();
    }
    return _promise;
  }
  wrapper.reset = async () => {
    const _prev = _promise;
    _promise = undefined;
    if (_prev) {
      await _prev;
    }
  };

  return wrapper;
}

/**
 * Promised `setTimeout`
 *
 * @category Promise
 *
 * @__NO_SIDE_EFFECTS__
 */
export function sleep(ms: number, callback?: Func) {
  return new Promise<void>(resolve =>
    setTimeout(async () => {
      await callback?.();
      resolve();
    }, ms)
  );
}

/**
 * Create a promise lock
 *
 * @category Promise
 * @example
 * ```
 * const lock = createPromiseLock()
 *
 * lock.run(async () => {
 *   await doSomething()
 * })
 *
 * // in anther context:
 * await lock.wait() // it will wait all tasking finished
 * ```
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createPromiseLock() {
  const locks: Promise<any>[] = [];

  return {
    clear() {
      locks.length = 0;
    },
    isWaiting() {
      return Boolean(locks.length);
    },
    async run<T = void>(fn: () => Promise<T>): Promise<T> {
      const p = fn();
      locks.push(p);
      try {
        return await p;
      }
      finally {
        remove(locks, p);
      }
    },
    async wait(): Promise<void> {
      await Promise.allSettled(locks);
    }
  };
}

/**
 * Promise with `resolve` and `reject` methods of itself
 */
export interface ControlledPromise<T = void> extends Promise<T> {
  reject: (reason?: any) => void;
  resolve: (value: T | PromiseLike<T>) => void;
}

/**
 * Return a Promise with `resolve` and `reject` methods
 *
 * @category Promise
 * @example
 * ```
 * const promise = createControlledPromise()
 *
 * await promise
 *
 * // in anther context:
 * promise.resolve(data)
 * ```
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createControlledPromise<T>(): ControlledPromise<T> {
  let reject: any, resolve: any;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as ControlledPromise<T>;
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

/**
 * Parallel Promise
 *
 * @category Promise
 *
 * @__NO_SIDE_EFFECTS__
 */
export function parallel<T, D = any>(tasks: T[], fn: (task: T) => Promise<D>) {
  return Promise.all(tasks.map(task => fn(task)));
}

/**
 * Safe Parallel Promise
 *
 * @category Promise
 *
 * @__NO_SIDE_EFFECTS__
 */
export function parallelSafe<T, D = any>(tasks: T[], fn: (task: T) => Promise<D>) {
  return Promise.allSettled(tasks.map(task => fn(task)));
}

/**
 * Serial Promise
 *
 * @category Promise
 *
 * @__NO_SIDE_EFFECTS__
 */
export function serial<T, D = any>(tasks: T[], fn: (task: T, previous: any) => Promise<D>) {
  return tasks.reduce<Promise<D>>(
    (promise, task) => promise.then(previous => fn(task, previous)),
    Promise.resolve<any>(null)
  );
}
