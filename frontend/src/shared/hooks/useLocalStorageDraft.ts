import { useEffect, useState } from 'react';

type UseLocalStorageDraftOptions<T> = {
  initialValue: T;
  key: string;
};

function readDraft<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorageDraft<T>({
  initialValue,
  key,
}: UseLocalStorageDraftOptions<T>) {
  const [value, setValue] = useState<T>(() => readDraft(key, initialValue));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.log('Failed to save file to local storage.');
    }
  }, [key, value]);

  function clearDraft() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    setValue(initialValue);
  }

  return [value, setValue, clearDraft] as const;
}
