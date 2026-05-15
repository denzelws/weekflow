import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  initialSeconds?: number;
  onComplete?: () => void;
}

export interface TimerState {
  seconds: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  formatted: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  toggle: () => void;
}

export function useTimer({
  initialSeconds = 25 * 60,
  onComplete,
}: UseTimerOptions = {}): TimerState {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef(initialSeconds);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clear();
            setIsActive(false);
            onComplete?.();
            return totalRef.current;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clear();
    }
    return clear;
  }, [isActive, isPaused, onComplete]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const reset = useCallback(() => {
    clear();
    setIsActive(false);
    setIsPaused(false);
    setSeconds(totalRef.current);
  }, []);

  const toggle = useCallback(() => {
    if (!isActive) {
      start();
    } else {
      pause();
    }
  }, [isActive, start, pause]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return {
    seconds,
    isActive,
    isPaused,
    progress: 1 - seconds / totalRef.current,
    formatted: `${mm}:${ss}`,
    start,
    pause,
    reset,
    toggle,
  };
}
