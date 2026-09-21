import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

/**
 * Animates a number from 0 to `target`, returning the formatted string.
 * Re-runs whenever `target` changes. Uses requestAnimationFrame so it also
 * works on web without a native driver.
 */
export function useCountUp(target: number, format: (value: number) => string, duration = 650): string {
  const [text, setText] = useState(() => format(target));
  const formatRef = useRef(format);

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    let raf = 0;
    let start = 0;

    const tick = (t: number) => {
      if (start === 0) start = t;
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / duration);
      setText(formatRef.current(target * easeOutCubic(progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return text;
}