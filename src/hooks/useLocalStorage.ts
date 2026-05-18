export function useLocalStorage(key: string) {
  const read = (): string | null => localStorage.getItem(key);

  const write = (value: string): void => {
    localStorage.setItem(key, value);
  };

  const remove = (): void => {
    localStorage.removeItem(key);
  };

  return { read, write, remove };
}
