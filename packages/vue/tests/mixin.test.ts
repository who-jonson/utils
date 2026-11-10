import { describe, expect, it } from 'vitest';

import * as vue from '../src/index';
import { useRipple } from '../src/ripple';

describe('index', () => {
  it('re-exports useRipple from the vue barrel', () => {
    expect(vue.useRipple).toBe(useRipple);
  });
});
