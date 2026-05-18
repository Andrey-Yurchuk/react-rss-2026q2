import { useCallback } from 'react';

export function useLocalStorage(key: string) {
  const read = useCallback((): string | null => localStorage.getItem(key), [key]);

  const write = useCallback(
    (value: string): void => {
      localStorage.setItem(key, value);
    },
    [key]
  );

  const remove = useCallback((): void => {
    localStorage.removeItem(key);
  }, [key]);

  return { read, write, remove };
}
