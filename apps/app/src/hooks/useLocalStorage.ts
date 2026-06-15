import { useCallback, useState } from "react";
import { toast } from "sonner";
import { STORAGE_WRITE_ERROR_MESSAGE } from "src/constants/ui";

type ParseStoredValue<T> = (raw: unknown, initialValue: T) => T;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parseStoredValue?: ParseStoredValue<T>
) {
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
      return parseStoredValue
        ? parseStoredValue(parsed, initialValue)
        : (parsed as T);
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

  return [storedValue, setValue] as const;
}
