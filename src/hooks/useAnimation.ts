import { useState, useEffect, useCallback } from "react";

export function useMounted(delayMs = 0): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return mounted;
}

export function useStagger(
  count: number,
  stepMs = 50,
  startDelayMs = 0,
): boolean[] {
  const [visible, setVisible] = useState<boolean[]>(Array(count).fill(false));

  useEffect(() => {
    setVisible(Array(count).fill(false));
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(
        () => {
          setVisible((v) => {
            const next = [...v];
            next[i] = true;
            return next;
          });
        },
        startDelayMs + i * stepMs,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [count, stepMs, startDelayMs]);

  return visible;
}

export function useOneShotTrigger(resetMs = 1200): [boolean, () => void] {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), resetMs);
    return () => clearTimeout(t);
  }, [resetMs]);

  return [active, trigger];
}
