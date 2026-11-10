import { describe, expect, it } from 'vitest';

import { deepMerge } from './obj';

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1);
  });
});

describe('deepMerge', () => {
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

  it('does not pollute Object.prototype via a JSON.parse __proto__ key', () => {
    const merged = deepMerge({}, JSON.parse('{"__proto__":{"polluted":"yes"}}'));

    expect(({} as any).polluted).toBeUndefined();
    expect(merged).toEqual({});
  });

  it('does not pollute Object.prototype via a nested __proto__ key', () => {
    const merged = deepMerge({ a: 1 }, JSON.parse('{"nested":{"__proto__":{"polluted":"yes"}}}'));

    expect(({} as any).polluted).toBeUndefined();
    expect(merged).toEqual({ a: 1, nested: {} });
  });
});
