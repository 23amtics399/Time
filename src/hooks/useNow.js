import { useState, useEffect, useRef } from 'react';

/**
 * useNow — returns the current Date, updated on a requestAnimationFrame loop.
 * @param {boolean} active - set false to pause ticking (saves CPU when not needed)
 * @param {number} precision - update frequency: 'second' or 'frame'
 */
export function useNow(active = true, precision = 'second') {
  const [now, setNow] = useState(() => new Date());
  const rafRef = useRef(null);
  const lastSecRef = useRef(-1);

  useEffect(() => {
    if (!active) return;

    function tick() {
      const d = new Date();
      if (precision === 'frame') {
        setNow(d);
      } else {
        // Only update once per second
        if (d.getSeconds() !== lastSecRef.current) {
          lastSecRef.current = d.getSeconds();
          setNow(d);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, precision]);

  return now;
}
