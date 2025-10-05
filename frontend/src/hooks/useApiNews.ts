/**
 * Хук для работы с API новостей
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { transformApiNewsItems } from '../utils/newsTransform';
import { NewsItem } from '../types/news';
import { mockNewsData } from '../data/mockData';

export interface UseApiNewsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
}

export interface UseApiNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
  updateNews: () => Promise<void>;
  isUpdating: boolean;
}

export function useApiNews(options: UseApiNewsOptions = {}): UseApiNewsReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getAllNews();
      
      const transformedNews = transformApiNewsItems(response.news);
      setNews(transformedNews);
      setTotalCount(response.total);
      setLastUpdate(response.last_update || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки новостей';
      setError(errorMessage);
      console.error('Failed to load news:', err);
      
      // Fallback на моковые данные при ошибке API
      console.log('Using fallback mock data');
      setNews(mockNewsData);
      setTotalCount(mockNewsData.length);
      setLastUpdate(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadNews();
  }, [loadNews]);

  const updateNews = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await apiService.updateNews();
      // После запуска обновления ждем немного и перезагружаем данные
      setTimeout(async () => {
        await loadNews();
        setIsUpdating(false);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления новостей';
      setError(errorMessage);
      setIsUpdating(false);
      console.error('Failed to update news:', err);
    }
  }, [loadNews]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Автообновление
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    news,
    loading,
    error,
    lastUpdate,
    totalCount,
    refresh,
    updateNews,
    isUpdating,
  };
}
