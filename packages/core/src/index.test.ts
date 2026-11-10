import { afterEach, describe, expect, it } from 'vitest';

import * as index from './index';
import { deepMerge } from './obj';

describe('should', () => {
  it('re-export deepMerge from the barrel', () => {
    expect(index.deepMerge).toBe(deepMerge);
  });
});

describe('deepMerge', () => {
  afterEach(() => {
    delete (Object.prototype as any).polluted;
  });

  it('merges flat objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('deep merges nested objects', () => {
    expect(deepMerge({ a: { b: 1 } }, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } });
  });

  it('merges multiple sources in order', () => {
    expect(deepMerge({ a: 1 }, { b: 2 }, { a: 3, c: 4 })).toEqual({ a: 3, b: 2, c: 4 });
  });

  it('replaces arrays wholesale', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] });
  });

  it('mutates and returns the target object', () => {
    const target = { a: 1 };
    const merged = deepMerge(target, { b: 2 });

    expect(merged).toBe(target);
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('keeps a scalar target value when the source value is an object', () => {
    expect(deepMerge({ a: 1 }, { a: { b: 2 } })).toEqual({ a: 1 });
  });

  it('does not pollute Object.prototype via a JSON.parse __proto__ key', () => {
    const merged = deepMerge({}, JSON.parse('{"__proto__":{"polluted":"yes"}}'));

    expect(({} as any).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    expect(merged).toEqual({});
  });

  it('does not pollute Object.prototype via a nested __proto__ key', () => {
    const merged = deepMerge({ a: 1 }, JSON.parse('{"nested":{"__proto__":{"polluted":"yes"}}}'));

    expect(({} as any).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(merged.nested)).toBe(Object.prototype);
    expect(merged).toEqual({ a: 1, nested: {} });
  });

  it('does not pollute Object.prototype via a constructor key', () => {
    const merged = deepMerge({}, JSON.parse('{"constructor":{"prototype":{"polluted":"yes"}}}'));

    expect(({} as any).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    expect(merged).toEqual({});
  });
});
