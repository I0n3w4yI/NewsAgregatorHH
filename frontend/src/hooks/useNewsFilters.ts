import { useState, useMemo } from 'react';
import { NewsItem, FilterState } from '../types/news';
import { categoriesData } from '../types/categories';

const ITEMS_PER_PAGE = 5;

export function useNewsFilters(newsData: NewsItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedSubcategories: [],
    todayOnly: false,
    sortOrder: 'newest',
    refreshInterval: 30 // Default to 30 seconds
  });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNews = useMemo(() => {
    let result = [...newsData];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(query) ||
          item.subcategory?.toLowerCase().includes(query)
      );
    }

    if (filters.selectedCategories.length > 0) {
      result = result.filter((item) => filters.selectedCategories.includes(item.category));
    }

    if (filters.selectedSubcategories.length > 0) {
      result = result.filter(
        (item) => item.subcategory && filters.selectedSubcategories.includes(item.subcategory)
      );
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
  }, [newsData, filters]);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredNews.slice(startIndex, endIndex);
  }, [filteredNews, currentPage]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    // Force re-filtering by updating a dummy filter
    setFilters(prev => ({ ...prev }));
    setCurrentPage(1);
  };

  return {
    filters,
    onFiltersChange: handleFiltersChange,
    categories: categoriesData,
    paginatedNews,
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    onRefresh: handleRefresh,
    totalResults: filteredNews.length
  };
}

