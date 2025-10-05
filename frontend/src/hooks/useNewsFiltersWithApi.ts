/**
 * Хук для работы с фильтрами новостей с API
 */

import { useState, useMemo } from 'react';
import { NewsItem, FilterState } from '../types/news';
import { categoriesData, transformApiCategories } from '../types/categories';
import { useApiNews } from './useApiNews';
import { useApiCategories } from './useApiCategories';

const ITEMS_PER_PAGE = 5;

export function useNewsFiltersWithApi() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedSubcategories: [],
    todayOnly: false,
    sortOrder: 'newest',
    refreshInterval: 30 // Default to 30 seconds
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Используем API хук
  const { 
    news: apiNews, 
    loading, 
    error, 
    refresh: apiRefresh, 
    updateNews: apiUpdateNews,
    isUpdating 
  } = useApiNews({
    autoRefresh: true,
    refreshInterval: filters.refreshInterval ? filters.refreshInterval * 1000 : undefined
  });

  // Используем API хук для категорий
  const { 
    categories: apiCategories, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useApiCategories();

  const filteredNews = useMemo(() => {
    let result = [...apiNews];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.subcategory?.toLowerCase().includes(query)
      );
    }

    // Фильтрация по категориям и подкатегориям
    if (filters.selectedCategories.length > 0 || filters.selectedSubcategories.length > 0) {
      result = result.filter((item) => {
        // Если выбраны и категории, и подкатегории, показываем новости, которые соответствуют ЛЮБОМУ из фильтров
        if (filters.selectedCategories.length > 0 && filters.selectedSubcategories.length > 0) {
          // Проверяем, соответствует ли новость выбранной категории
          const matchesCategory = filters.selectedCategories.includes(item.category);
          // Проверяем, соответствует ли новость выбранной подкатегории
          const matchesSubcategory = item.subcategory && filters.selectedSubcategories.includes(item.subcategory);
          
          return matchesCategory || matchesSubcategory;
        }
        
        // Если выбраны только категории
        if (filters.selectedCategories.length > 0) {
          return filters.selectedCategories.includes(item.category);
        }
        
        // Если выбраны только подкатегории
        if (filters.selectedSubcategories.length > 0) {
          return item.subcategory && filters.selectedSubcategories.includes(item.subcategory);
        }
        
        return true;
      });
    }

    if (filters.todayOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [apiNews, filters]);

  const itemsPerPage = ITEMS_PER_PAGE;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredNews.slice(startIndex, endIndex);
  }, [filteredNews, currentPage, itemsPerPage]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    await apiRefresh();
    setCurrentPage(1);
  };

  const handleUpdateNews = async () => {
    await apiUpdateNews();
  };

  return {
    filters,
    onFiltersChange: handleFiltersChange,
    categories: apiCategories.length > 0 ? transformApiCategories(apiCategories) : categoriesData,
    apiCategories: apiCategories, // Передаем API категории для отображения количества новостей
    paginatedNews,
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    onRefresh: handleRefresh,
    onUpdateNews: handleUpdateNews,
    totalResults: filteredNews.length,
    loading: loading || categoriesLoading,
    error: error || categoriesError,
    isUpdating
  };
}
