import { useDebounce } from 'use-debounce';

export function useDebouncedValue(value: string, delayMs = 300): string {
  const [debounced] = useDebounce(value, delayMs);
  return debounced;
}
