import { useCallback, useEffect, useRef, useState } from "react";

export function useTransientMessage(durationMs = 4000) {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const displayMessage = useCallback(
    (text: string) => {
      setMessage(text);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(""), durationMs);
    },
    [durationMs]
  );

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
    },
    []
  );

  return { message, setMessage, displayMessage };
}
