import { describe, expect, it } from 'vitest';

import * as core from '../packages/core/src/index';

describe('index', () => {
  it('re-exports deepMerge from the core barrel', () => {
    expect(typeof core.deepMerge).toBe('function');
  });
});
