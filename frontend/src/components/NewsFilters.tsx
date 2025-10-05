import { Search, ChevronDown } from 'lucide-react';
import { FilterState } from '../types/news';
import { CategoryStructure } from '../types/categories';
import { useState } from 'react';

interface NewsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: CategoryStructure[];
}

export function NewsFilters({
  filters,
  onFiltersChange,
  categories
}: NewsFiltersProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCategoryClick = (categoryName: string) => {
    const hasSubcategories = categories.find(cat => cat.name === categoryName)?.subcategories && 
                            categories.find(cat => cat.name === categoryName)?.subcategories!.length !== undefined &&
                            categories.find(cat => cat.name === categoryName)!.subcategories!.length > 0;
    
    if (hasSubcategories) {
      // If category has subcategories, toggle the dropdown first
      toggleCategory(categoryName);
    }
    
    // Toggle category selection
    const isSelected = filters.selectedCategories.includes(categoryName);
    const newSelectedCategories = isSelected
      ? filters.selectedCategories.filter(cat => cat !== categoryName)
      : [...filters.selectedCategories, categoryName];
    
    onFiltersChange({
      ...filters,
      selectedCategories: newSelectedCategories,
      // Clear subcategories when category is deselected
      selectedSubcategories: isSelected 
        ? filters.selectedSubcategories.filter(sub => {
            const category = categories.find(cat => cat.name === categoryName);
            return !category?.subcategories?.includes(sub);
          })
        : filters.selectedSubcategories
    });
  };

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    const isSelected = filters.selectedSubcategories.includes(subcategory);
    const newSelectedSubcategories = isSelected
      ? filters.selectedSubcategories.filter(sub => sub !== subcategory)
      : [...filters.selectedSubcategories, subcategory];
    
    // Ensure parent category is selected when subcategory is selected
    const newSelectedCategories = isSelected 
      ? filters.selectedCategories
      : filters.selectedCategories.includes(categoryName)
        ? filters.selectedCategories
        : [...filters.selectedCategories, categoryName];
    
    onFiltersChange({
      ...filters,
      selectedCategories: newSelectedCategories,
      selectedSubcategories: newSelectedSubcategories
    });
  };

  return (
    <div className="bg-[#101010] border border-white rounded-lg p-6 mt-11 flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск по тексту"
              value={filters.searchQuery}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchQuery: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>
        </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-400 text-sm font-medium">Категории</h3>
            {(filters.selectedCategories.length > 0 || filters.selectedSubcategories.length > 0) && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                {filters.selectedCategories.length + filters.selectedSubcategories.length} выбрано
              </span>
            )}
          </div>
          {(filters.selectedCategories.length > 0 || filters.selectedSubcategories.length > 0) && (
            <button
              onClick={() => onFiltersChange({
                ...filters,
                selectedCategories: [],
                selectedSubcategories: []
              })}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Очистить все
            </button>
          )}
        </div>
        <div className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.name);
            const isCategorySelected = filters.selectedCategories.includes(category.name);
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;

            return (
              <div key={category.name} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${
                    isCategorySelected
                      ? 'bg-gray-200 text-[#101010] font-medium'
                      : 'bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      isCategorySelected
                        ? 'bg-[#101010] border-[#101010]'
                        : 'border-gray-500'
                    }`}>
                      {isCategorySelected && (
                        <svg
                          className="w-3 h-3 text-gray-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-left">{category.name}</span>
                  </div>
                  {hasSubcategories && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {hasSubcategories && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="bg-[#101010] border-l-2 border-gray-700 ml-4">
                      {category.subcategories!.map((subcategory) => {
                        const isSubcategorySelected = filters.selectedSubcategories.includes(subcategory);

                        return (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategoryClick(category.name, subcategory)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              isSubcategorySelected
                                ? 'bg-gray-700 text-white font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                            }`}
                          >
                            <div className={`w-3 h-3 border-2 rounded flex items-center justify-center ${
                              isSubcategorySelected
                                ? 'bg-white border-white'
                                : 'border-gray-500'
                            }`}>
                              {isSubcategorySelected && (
                                <svg
                                  className="w-2 h-2 text-gray-800"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-left">{subcategory}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.todayOnly}
              onChange={(e) =>
                onFiltersChange({ ...filters, todayOnly: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-gray-700 rounded bg-[#1a1a1a] peer-checked:bg-gray-200 peer-checked:border-gray-200 transition-all duration-200 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-[#101010] hidden peer-checked:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <span className="text-gray-300 group-hover:text-white transition-colors">
            Только сегодня
          </span>
        </label>
      </div>
      </div>

      {/* Сортировка - выровнена по нижней грани */}
      <div className="mt-4 text-center">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Сортировка:</span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onFiltersChange({ ...filters, sortOrder: 'newest' })
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.sortOrder === 'newest'
                  ? 'bg-gray-200 text-[#101010]'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-gray-700'
              }`}
            >
              Новые
            </button>
            <button
              onClick={() =>
                onFiltersChange({ ...filters, sortOrder: 'oldest' })
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.sortOrder === 'oldest'
                  ? 'bg-gray-200 text-[#101010]'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-gray-700'
              }`}
            >
              Старые
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

