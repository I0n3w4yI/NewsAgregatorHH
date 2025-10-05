import { useEffect, useRef, useState } from 'react';

interface UseAutoRefreshProps {
  refreshInterval: number | null; // seconds
  onRefresh: () => void;
  isEnabled?: boolean;
}

export function useAutoRefresh({ 
  refreshInterval, 
  onRefresh, 
  isEnabled = true 
}: UseAutoRefreshProps) {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (!isEnabled || !refreshInterval) {
      setTimeUntilRefresh(null);
      return;
    }

    // Set up refresh interval
    intervalRef.current = setInterval(() => {
      onRefresh();
    }, refreshInterval * 1000);

    // Set up countdown timer
    setTimeUntilRefresh(refreshInterval);
    countdownRef.current = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev === null || prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [refreshInterval, onRefresh, isEnabled]);

  return {
    timeUntilRefresh,
    isRefreshing: timeUntilRefresh !== null
  };
}
