export interface NewsItem {
  id: string;
  category: string;
  subcategory?: string;
  text: string;
  date: string;
  sourceUrl: string;
  title: string;
  fullContent: string;
  author: string;
  imageUrl?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
  todayOnly: boolean;
  sortOrder: 'newest' | 'oldest';
  refreshInterval: 10 | 30 | 60 | null; // seconds, null means no auto-refresh
}

// API типы для нового микросервиса
export interface ApiNewsItem {
  title: string;
  link: string;
  description: string;
  published: string;
  source: string;
  source_url: string;
  category: string;
  summary?: string;
}

export interface ApiNewsResponse {
  news: ApiNewsItem[];
  total: number;
  last_update?: string;
}

export interface ApiCategoryResponse {
  categories: Array<{
    category: string;
    count: number;
    news_count: number;
  }>;
  total_categories: number;
}

export interface ApiStatsResponse {
  total_news: number;
  categories_count: number;
  sources_count: number;
  last_update: string;
  categories: Record<string, number>;
}

