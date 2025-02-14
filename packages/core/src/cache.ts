// A simple TTL cache with max capacity option, ms resolution,
// autopurge, and reasonably optimized performance
// Relies on the fact that integer Object keys are kept sorted,
// and managed very efficiently by V8.
import { tap } from './func';
import { isPromise, isThenable } from './is';

interface SetOptions {
  /**
   * Do not call dispose() function when overwriting a key with a new value
   * Overrides the value set in the constructor.
   */
  noDisposeOnSet?: boolean;

  /**
   * Do not update the TTL when overwriting an existing item.
   */
  noUpdateTTL?: boolean;

  /**
   * Override the default TTL for this one set() operation.
   * Required if a TTL was not set in the constructor options.
   */
  ttl?: number;
}

interface GetOptions {
  /**
   * In the event that an item's expiration timer hasn't yet fired,
   * and an attempt is made to get() it, then return undefined and
   * delete it, rather than returning the cached value.
   *
   * By default, items are only expired when their timer fires, so there's
   * a bit of a "best effort" expiration, and the cache will return a value
   * if it has one, even if it's technically stale.
   *
   * @default false
   */
  checkAgeOnGet?: boolean;

  /**
   * Set new TTL, applied only when `updateAgeOnGet` is true
   */
  ttl?: number;

  /**
   * Update the age of items on cache.get(), renewing their TTL
   *
   * @default false
   */
  updateAgeOnGet?: boolean;
}

const perf
  = /* @__PURE__ */ typeof performance === 'object'
    && performance
    && typeof performance.now === 'function'
    ? performance
    : Date;

const now = /* @__PURE__ */ () => perf.now();
const isPosInt = /* @__PURE__ */ n => n && n === Math.floor(n) && n > 0 && Number.isFinite(n);
const isPosIntOrInf = /* @__PURE__ */ n => n === Infinity || isPosInt(n);

export class TTLCache<K, V> implements Iterable<[K, V]> {
  /**
   * Max time in milliseconds for items to live in cache before they are
   * considered stale.  Note that stale items are NOT preemptively removed
   * by default, and MAY live in the cache, contributing to max,
   * long after they have expired.
   *
   * Must be an integer number of ms, or Infinity.  Defaults to `undefined`,
   * meaning that a TTL must be set explicitly for each set()
   */
  ttl?: number;

  /**
   * Boolean flag to tell the cache to not update the TTL when
   * setting a new value for an existing key (ie, when updating a value
   * rather than inserting a new value).  Note that the TTL value is
   * _always_ set when adding a new entry into the cache.
   *
   * @default false
   */
  noUpdateTTL: boolean = false;

  /**
   * The number of items to keep.
   *
   * @default Infinity
   */
  max: number = Infinity;

  /**
   * Update the age of items on cache.get(), renewing their TTL
   *
   * @default false
   */
  updateAgeOnGet: boolean = false;

  /**
   * In the event that an item's expiration timer hasn't yet fired,
   * and an attempt is made to get() it, then return undefined and
   * delete it, rather than returning the cached value.
   *
   * By default, items are only expired when their timer fires, so there's
   * a bit of a "best effort" expiration, and the cache will return a value
   * if it has one, even if it's technically stale.
   *
   * @default false
   */
  checkAgeOnGet: boolean = false;

  /**
   * Do not call dispose() function when overwriting a key with a new value
   *
   * @default false
   */
  noDisposeOnSet: boolean = false;

  /**
   * Function that is called on items when they are dropped from the cache.
   * This can be handy if you want to close file descriptors or do other
   * cleanup tasks when items are no longer accessible. Called with `key,
   * value`.  It's called before actually removing the item from the
   * internal cache, so it is *NOT* safe to re-add them.
   * Use `disposeAfter` if you wish to dispose items after they have been
   * full removed, when it is safe to add them back to the cache.
   */
  dispose: ((
    value: V,
    key: K,
    reason: 'set' | 'evict' | 'stale' | 'delete'
  ) => void) = (_, __, ___) => {};

  // {[expirationTime]: [keys]}
  protected expirations: { [p: number]: any } = Object.create(null);
  // {key=>val}
  data = new Map<K, V>();
  // {key=>expiration}
  protected expirationMap = new Map<K, number>();

  protected timerExpiration: any;
  protected timer: Parameters<typeof clearTimeout>[0];

  constructor(
    {
      dispose,
      max,
      ttl,
      ...opts
    }: Partial<
      Pick<TTLCache<K, V>, 'ttl' | 'max' | 'dispose' | 'noUpdateTTL' | 'checkAgeOnGet' | 'updateAgeOnGet' | 'noDisposeOnSet'>
    >
  ) {
    if (ttl) {
      if (!isPosIntOrInf(ttl)) {
        throw new TypeError('ttl must be positive integer or Infinity if set');
      }
      this.ttl = ttl;
    }

    if (max) {
      if (!isPosIntOrInf(max)) {
        throw new TypeError('max must be positive integer or Infinity');
      }
      this.max = max;
    }

    if (dispose) {
      if (typeof dispose !== 'function') {
        throw new TypeError('dispose must be function if set');
      }
      this.dispose = dispose;
    }

    Object.assign(
      this,
      ['noUpdateTTL', 'checkAgeOnGet', 'updateAgeOnGet', 'noDisposeOnSet']
        .reduce((obj, key) => ({
          ...obj,
          [key]: !!opts[key]
        }), {})
    );
  }

  setTimer(expiration: number, ttl: number) {
    if (this.timerExpiration < expiration) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const t = setTimeout(() => {
      this.timer = this.timerExpiration = undefined;
      this.purgeStale();
      this.setTimer(this.expirations[0], Number(this.expirations[0]) - now());
    }, ttl);

    /* istanbul ignore else - affordance for non-node envs */
    if (t.unref)
      t.unref();

    this.timerExpiration = expiration;
    this.timer = t;
  }

  // hang onto the timer so we can clearTimeout if all items
  // are deleted.  Deno doesn't have Timer.unref(), so it
  // hangs otherwise.
  cancelTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timerExpiration = this.timer = undefined;
    }
  }

  clear() {
    const entries // @ts-ignore
      = this.dispose !== TTLCache.prototype.dispose ? [...this] : [];
    this.data.clear();
    this.expirationMap.clear();
    // no need for any purging now
    this.cancelTimer();
    this.expirations = Object.create(null);
    for (const [key, val] of entries) {
      this.dispose(val, key, 'delete');
    }
  }

  setTTL(key: K, ttl = this.ttl) {
    const current = this.expirationMap.get(key);
    if (current !== undefined) {
      // remove from the expirations list, so it isn't purged
      const exp = this.expirations[current];
      if (!exp || exp.length <= 1) {
        delete this.expirations[current];
      }
      else {
        this.expirations[current] = exp.filter(k => k !== key);
      }
    }

    if (ttl && ttl !== Infinity) {
      const expiration = Math.floor(now() + ttl);
      this.expirationMap.set(key, expiration);
      if (!this.expirations[expiration]) {
        this.expirations[expiration] = [];
        this.setTimer(expiration, ttl);
      }
      this.expirations[expiration].push(key);
    }
    else {
      this.expirationMap.set(key, Infinity);
    }
  }

  set(
    key: K,
    val: V,
    {
      noDisposeOnSet = this.noDisposeOnSet,
      noUpdateTTL = this.noUpdateTTL,
      ttl = this.ttl
    }: SetOptions = {}
  ): this {
    if (!isPosIntOrInf(ttl)) {
      throw new TypeError('ttl must be positive integer or Infinity');
    }
    if (this.expirationMap.has(key)) {
      if (!noUpdateTTL) {
        this.setTTL(key, ttl);
      }
      // has old value
      const oldValue = this.data.get(key);
      if (oldValue !== val) {
        this.data.set(key, val);
        if (!noDisposeOnSet) {
          this.dispose(oldValue as V, key, 'set');
        }
      }
    }
    else {
      this.setTTL(key, ttl);
      this.data.set(key, val);
    }

    while (this.size > this.max) {
      this.purgeToCapacity();
    }

    return this;
  }

  has(key: K) {
    return this.data.has(key);
  }

  getRemainingTTL(key: K) {
    const expiration = this.expirationMap.get(key);
    return expiration === Infinity
      ? expiration
      : expiration !== undefined
        ? Math.max(0, Math.ceil(expiration - now()))
        : 0;
  }

  get<T = V>(
    key: K,
    {
      checkAgeOnGet = this.checkAgeOnGet,
      ttl = this.ttl,
      updateAgeOnGet = this.updateAgeOnGet
    }: GetOptions = {}
  ): T | undefined {
    const val = this.data.get(key);
    if (checkAgeOnGet && this.getRemainingTTL(key) === 0) {
      this.delete(key);
      return undefined;
    }
    if (updateAgeOnGet) {
      this.setTTL(key, ttl);
    }
    return val as unknown as T;
  }

  delete(key: K) {
    const current = this.expirationMap.get(key);
    if (current !== undefined) {
      const value = this.data.get(key);
      this.data.delete(key);
      this.expirationMap.delete(key);
      const exp = this.expirations[current];
      if (exp) {
        if (exp.length <= 1) {
          delete this.expirations[current];
        }
        else {
          this.expirations[current] = exp.filter(k => k !== key);
        }
      }
      this.dispose(value!, key, 'delete');
      if (this.size === 0) {
        this.cancelTimer();
      }
      return true;
    }
    return false;
  }

  purgeToCapacity() {
    for (const exp in this.expirations) {
      const keys = this.expirations[exp];
      if (this.size - keys.length >= this.max) {
        delete this.expirations[exp];
        const entries: [K, V][] = [];
        for (const key of keys) {
          entries.push([key, this.data.get(key)!]);
          this.data.delete(key);
          this.expirationMap.delete(key);
        }
        for (const [key, val] of entries) {
          this.dispose(val, key, 'evict');
        }
      }
      else {
        const s = this.size - this.max;
        const entries: [K, V][] = [];
        for (const key of keys.splice(0, s)) {
          entries.push([key, this.data.get(key)!]);
          this.data.delete(key);
          this.expirationMap.delete(key);
        }
        for (const [key, val] of entries) {
          this.dispose(val, key, 'evict');
        }
        return;
      }
    }
  }

  get size(): number {
    return this.data.size;
  }

  purgeStale() {
    const n = Math.ceil(now());
    for (const exp in this.expirations) {
      if (exp === 'Infinity' || Number(exp) > n) {
        return;
      }

      const keys = [...(this.expirations[exp] || [])];
      const entries: [K, V][] = [];
      delete this.expirations[exp];
      for (const key of keys) {
        entries.push([key, this.data.get(key)!]);
        this.data.delete(key);
        this.expirationMap.delete(key);
      }
      for (const [key, val] of entries) {
        this.dispose(val, key, 'stale');
      }
    }
    if (this.size === 0) {
      this.cancelTimer();
    }
  }

  *entries(): Generator<[K, V]> {
    for (const exp in this.expirations) {
      for (const key of this.expirations[exp]) {
        yield [key, this.data.get(key)!];
      }
    }
  }

  *keys(): Generator<K> {
    for (const exp in this.expirations) {
      for (const key of this.expirations[exp]) {
        yield key;
      }
    }
  }

  *values(): Generator<V> {
    for (const exp in this.expirations) {
      for (const key of this.expirations[exp]) {
        yield this.data.get(key)!;
      }
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   *
   * @param {string} key
   * @param {number} ttl - in milliseconds
   * @param {Function} fetchMethod
   */
  public static remember<T extends ((...args: any[]) => any)>(key: string, ttl: number, fetchMethod: T): ReturnType<T> {
    const cache = rememberedFunctions();
    if (cache.has(key)) {
      return cache.get(key);
    }

    return resolveIfPromiseLike<ReturnType<T>>(fetchMethod(), (result) => {
      cache.set(key, result, { ttl });
      return result;
    });
  }
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function ttlCache<K, V>(...args: ConstructorParameters<typeof TTLCache>): TTLCache<K, V> {
  return new TTLCache<K, V>(...args);
}

const __rememberedFunctions = /* @__PURE__ */ new TTLCache<string, any>({ ttl: 2 * 60 * 60 * 1000, updateAgeOnGet: false });

/**
 * @__NO_SIDE_EFFECTS__
 */
function rememberedFunctions() {
  return __rememberedFunctions;
}

const cachedFunctions = /* @__PURE__ */ new TTLCache<string, any>({ ttl: 2 * 60 * 60 * 1000, updateAgeOnGet: false });

/**
 * @__NO_SIDE_EFFECTS__
 */
export function createCachedFunction<T extends ((...args: any[]) => any)>(
  fn: T,
  {
    checkAgeOnGet,
    noDisposeOnSet,
    noUpdateTTL,
    ttl,
    updateAgeOnGet
  }: Partial<ConstructorParameters<typeof TTLCache>[0]> = {}
): T {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      if (cachedFunctions.has(cacheKey)) {
        return cachedFunctions.get(
          cacheKey,
          { checkAgeOnGet, ttl, updateAgeOnGet }
        );
      }

      return resolveIfPromiseLike<ReturnType<T>>(
        Reflect.apply(target, thisArg, args),
        (result) => {
          cachedFunctions.set(cacheKey, result, { noDisposeOnSet, noUpdateTTL, ttl });
          return result;
        }
      );
    }
  });
}

function resolveIfPromiseLike<T, D = T>(val: any, onResolve?: (result: any) => any) {
  return tap<T, D>(val, (result) => {
    if (!isPromise(result) && !isThenable(result)) {
      return onResolve?.(result) ?? result;
    }

    return new Promise((_resolve, _reject) => {
      if (isPromise(result)) {
        return result
          .catch(_reject)
          .then(r => _resolve(onResolve?.(r) ?? r));
      }

      return result
        .then(r => _resolve(onResolve?.(r) ?? r));
    });
  });
}
