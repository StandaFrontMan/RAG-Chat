import { useEffect, useRef } from "react";

export function useAbortSignal() {
  const ref = useRef<AbortController | null>(null);

  useEffect(() => () => ref.current?.abort(), []); // отмена при размонтировании

  return () => {
    ref.current?.abort(); // отменяем предыдущий запрос (например, двойной клик)
    ref.current = new AbortController();
    return ref.current.signal;
  };
}