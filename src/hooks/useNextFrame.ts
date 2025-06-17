import { useEffect } from 'react';

export function useNextFrameEffect(callback: () => void, deps: any[]) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      callback();
    });
    return () => cancelAnimationFrame(frame);
  }, deps);
}
