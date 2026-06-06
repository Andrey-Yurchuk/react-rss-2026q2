import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'test-storage-key';

describe('useLocalStorage', () => {
  it('reads null when key is not set', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    expect(result.current.read()).toBeNull();
  });

  it('reads stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'pikachu');
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    expect(result.current.read()).toBe('pikachu');
  });

  it('writes value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    result.current.write('bulbasaur');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('bulbasaur');
  });

  it('removes value from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'pikachu');
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    result.current.remove();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
