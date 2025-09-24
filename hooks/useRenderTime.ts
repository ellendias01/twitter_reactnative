// hooks/useRenderTime.ts
import { useEffect, useRef } from 'react';
import AnalyticsService from '../services/AnalyticsService';

/**
 * Hook personalizado para medir tempo de renderização
 */
export const useRenderTime = (screenName: string) => {
  const startTime = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    AnalyticsService.logRenderTime(screenName, renderTime);
  }, [screenName]);
};