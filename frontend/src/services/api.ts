/**
 * API сервис для работы с микросервисом новостей
 */

import { ApiNewsItem, ApiNewsResponse, ApiCategoryResponse, ApiStatsResponse } from '../types/news';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Выполняет HTTP запрос с обработкой ошибок
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Получить все новости
   */
  async getAllNews(limit?: number, offset: number = 0): Promise<ApiNewsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/news/all?${queryString}` : '/news/all';
    
    return this.request<ApiNewsResponse>(endpoint);
  }

  /**
   * Получить топ-новости
   */
  async getTopNews(): Promise<ApiNewsResponse> {
    return this.request<ApiNewsResponse>('/news/top');
  }

  /**
   * Получить новости по категории
   */
  async getNewsByCategory(category: string, limit?: number): Promise<ApiNewsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/news/category/${encodeURIComponent(category)}?${queryString}`
      : `/news/category/${encodeURIComponent(category)}`;
    
    return this.request<ApiNewsResponse>(endpoint);
  }

  /**
   * Получить список категорий
   */
  async getCategories(): Promise<ApiCategoryResponse> {
    return this.request<ApiCategoryResponse>('/categories');
  }

  /**
   * Получить статистику
   */
  async getStats(): Promise<ApiStatsResponse> {
    return this.request<ApiStatsResponse>('/stats');
  }

  /**
   * Запустить обновление новостей
   */
  async updateNews(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/update', {
      method: 'POST',
    });
  }

  /**
   * Проверить состояние API
   */
  async healthCheck(): Promise<{
    status: string;
    is_updating: boolean;
    last_update?: string;
    cached_news: number;
  }> {
    return this.request<{
      status: string;
      is_updating: boolean;
      last_update?: string;
      cached_news: number;
    }>('/health');
  }
}

// Экспортируем экземпляр сервиса
export const apiService = new ApiService();
