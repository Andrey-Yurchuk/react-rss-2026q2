import { describe, expect, it } from 'vitest';
import { parsePageParam } from './urlParams';

describe('parsePageParam', () => {
  it('returns 1 when param is missing', () => {
    expect(parsePageParam(null)).toBe(1);
  });

  it('returns parsed page for valid value', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('returns 1 for invalid value', () => {
    expect(parsePageParam('abc')).toBe(1);
    expect(parsePageParam('0')).toBe(1);
  });
});
