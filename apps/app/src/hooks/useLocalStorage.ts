import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { STORAGE_WRITE_ERROR_MESSAGE } from "src/constants/ui";

type ParseStoredValue<T> = (raw: unknown, initialValue: T) => T;
type UseLocalStorageOptions = {
  persistParsedValue?: boolean;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parseStoredValue?: ParseStoredValue<T>,
  options: UseLocalStorageOptions = {}
) {
  const shouldPersistParsedValueRef = useRef(false);
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);

      if (!item) {
        return initialValue;
      }

      const parsed: unknown = JSON.parse(item);
      const valueToStore = parseStoredValue
        ? parseStoredValue(parsed, initialValue)
        : (parsed as T);

      if (options.persistParsedValue && JSON.stringify(valueToStore) !== item) {
        shouldPersistParsedValueRef.current = true;
      }

      return valueToStore;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          console.warn(error);
          toast(STORAGE_WRITE_ERROR_MESSAGE);
        }

        return valueToStore;
      });
    },
    [key]
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !options.persistParsedValue ||
      !shouldPersistParsedValueRef.current
    ) {
      return;
    }

    shouldPersistParsedValueRef.current = false;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(error);
      toast(STORAGE_WRITE_ERROR_MESSAGE);
    }
  }, [key, options.persistParsedValue, storedValue]);

  return [storedValue, setValue] as const;
}
