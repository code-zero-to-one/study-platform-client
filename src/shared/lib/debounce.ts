import { useEffect, useState } from 'react';

export function useDebounce(value: string, delay: number = 500) {
  const [debounced, setDebounced] = useState<string>(value);

  useEffect(() => {
    const timeId = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeId);
  }, [value, delay]);

  return debounced;
}
