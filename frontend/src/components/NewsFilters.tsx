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
    const category = categories.find(cat => cat.name === categoryName);
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    
    // Toggle category selection
    const isSelected = filters.selectedCategories.includes(categoryName);
    const newSelectedCategories = isSelected
      ? filters.selectedCategories.filter(cat => cat !== categoryName)
      : [...filters.selectedCategories, categoryName];
    
    // Handle subcategories based on category selection
    let newSelectedSubcategories = [...filters.selectedSubcategories];
    
    if (hasSubcategories) {
      if (isSelected) {
        // When deselecting a category, also deselect all its subcategories
        newSelectedSubcategories = newSelectedSubcategories.filter(sub => 
          !category?.subcategories?.includes(sub)
        );
      } else {
        // When selecting a category, also select all its subcategories
        const categorySubcategories = category?.subcategories || [];
        newSelectedSubcategories = [
          ...newSelectedSubcategories.filter(sub => 
            !categorySubcategories.includes(sub)
          ),
          ...categorySubcategories
        ];
      }
    }
    
    onFiltersChange({
      ...filters,
      selectedCategories: newSelectedCategories,
      selectedSubcategories: newSelectedSubcategories
    });
  };

  const handleCategoryHeaderClick = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    
    if (hasSubcategories) {
      // If category has subcategories, toggle the dropdown
      toggleCategory(categoryName);
    } else {
      // If no subcategories, toggle category selection
      handleCategoryClick(categoryName);
    }
  };

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    const isSelected = filters.selectedSubcategories.includes(subcategory);
    const newSelectedSubcategories = isSelected
      ? filters.selectedSubcategories.filter(sub => sub !== subcategory)
      : [...filters.selectedSubcategories, subcategory];
    
    // Find the category to get its subcategories
    const category = categories.find(cat => cat.name === categoryName);
    const categorySubcategories = category?.subcategories || [];
    
    // Check if all subcategories of this category are selected
    const allSubcategoriesSelected = categorySubcategories.every(sub => 
      newSelectedSubcategories.includes(sub)
    );
    
    // Update category selection based on subcategory selection
    let newSelectedCategories = [...filters.selectedCategories];
    
    if (isSelected) {
      // When deselecting a subcategory, deselect the parent category
      newSelectedCategories = newSelectedCategories.filter(cat => cat !== categoryName);
    } else {
      // When selecting a subcategory, only select the parent category if ALL subcategories are selected
      if (allSubcategoriesSelected && !newSelectedCategories.includes(categoryName)) {
        newSelectedCategories = [...newSelectedCategories, categoryName];
      }
    }
    
    onFiltersChange({
      ...filters,
      selectedCategories: newSelectedCategories,
      selectedSubcategories: newSelectedSubcategories
    });
  };

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 mt-11 flex flex-col h-full overflow-hidden">
      <div className="flex-1">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Поиск по тексту"
              value={filters.searchQuery}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchQuery: e.target.value })
              }
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-button)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-secondary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-tertiary)] transition-colors"
            />
          </div>
        </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[var(--text-secondary)] text-sm font-medium">Категории</h3>
            <div className="h-6 flex items-center">
              {(filters.selectedCategories.length > 0 || filters.selectedSubcategories.length > 0) && (
                <span className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-1 rounded-full">
                  {filters.selectedCategories.length + filters.selectedSubcategories.length} выбрано
                </span>
              )}
            </div>
          </div>
          <div className="h-6 flex items-center">
            {(filters.selectedCategories.length > 0 || filters.selectedSubcategories.length > 0) && (
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  selectedCategories: [],
                  selectedSubcategories: []
                })}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Очистить все
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.name);
            const isCategorySelected = filters.selectedCategories.includes(category.name);
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;

            return (
              <div key={category.name} className="rounded-lg">
                <div className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                  isCategorySelected
                    ? 'bg-gray-200 border border-[var(--border-button)] text-[#101010] font-medium'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-button)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                        isCategorySelected
                          ? 'bg-[var(--text-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-tertiary)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      {isCategorySelected && (
                        <svg
                          className="w-3 h-3 text-[var(--bg-secondary)]"
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
                    </button>
                    <button
                      onClick={() => handleCategoryHeaderClick(category.name)}
                      className="text-left flex-1 hover:text-[var(--text-primary)] transition-colors"
                    >
                      {category.name}
                    </button>
                  </div>
                  {hasSubcategories && (
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="hover:bg-[var(--bg-tertiary)] rounded p-1 transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {hasSubcategories && (
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="bg-[var(--bg-primary)] border-l-2 border-[var(--border-secondary)] ml-4 space-y-1 p-1">
                      {category.subcategories!.map((subcategory) => {
                        const isSubcategorySelected = filters.selectedSubcategories.includes(subcategory);

                        return (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategoryClick(category.name, subcategory)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                              isSubcategorySelected
                                ? 'bg-[var(--bg-tertiary)] border border-[var(--border-tertiary)] text-[var(--text-primary)] font-medium'
                                : 'border border-[var(--border-button)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <div className={`w-3 h-3 border-2 rounded flex items-center justify-center ${
                              isSubcategorySelected
                                ? 'bg-[var(--text-primary)] border-[var(--text-primary)]'
                                : 'border-[var(--border-tertiary)]'
                            }`}>
                              {isSubcategorySelected && (
                                <svg
                                  className="w-2 h-2 text-[var(--bg-primary)]"
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
            <div className="w-4 h-4 border-2 border-[var(--border-tertiary)] rounded bg-[var(--bg-secondary)] peer-checked:bg-[var(--text-primary)] peer-checked:border-[var(--text-primary)] transition-all duration-200 flex items-center justify-center">
              <svg
                className="w-2 h-2 text-[var(--bg-primary)] hidden peer-checked:block"
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
          <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            Только сегодня
          </span>
        </label>
      </div>
      </div>

      {/* Сортировка - выровнена по нижней грани */}
      <div className="mt-4 text-center">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-secondary)] text-sm">Сортировка:</span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onFiltersChange({ ...filters, sortOrder: 'newest' })
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.sortOrder === 'newest'
                  ? 'bg-gray-200 border border-[var(--border-button)] text-[#101010]'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-button)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-tertiary)]'
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
                  ? 'bg-gray-200 border border-[var(--border-button)] text-[#101010]'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-button)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-tertiary)]'
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

