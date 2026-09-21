import { useEffect, useState } from 'react';

/**
 * Simulates a short network fetch on mount so skeleton states are visible.
 * Data is local/mock, so the delay is only for presentation.
 */
export function useSimulatedLoading(ms = 380): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(timer);
  }, [ms]);

  return loading;
}