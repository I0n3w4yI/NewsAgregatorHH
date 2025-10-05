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

