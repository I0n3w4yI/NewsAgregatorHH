/**
 * Хук для работы с категориями из API
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export interface ApiCategory {
  category: string;
  count: number;
  news_count: number;
}

export interface ApiCategoriesResponse {
  categories: ApiCategory[];
  total_categories: number;
}

export interface UseApiCategoriesReturn {
  categories: ApiCategory[];
  loading: boolean;
  error: string | null;
  totalCategories: number;
  refresh: () => Promise<void>;
}

export function useApiCategories(): UseApiCategoriesReturn {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCategories, setTotalCategories] = useState(0);

  const loadCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getCategories();
      
      setCategories(response.categories);
      setTotalCategories(response.total_categories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки категорий';
      setError(errorMessage);
      console.error('Failed to load categories:', err);
      
      // Fallback на пустой массив при ошибке API
      setCategories([]);
      setTotalCategories(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadCategories();
  }, [loadCategories]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    totalCategories,
    refresh,
  };
}
