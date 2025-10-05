import { Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NewsCard } from './components/NewsCard';
import { NewsFilters } from './components/NewsFilters';
import { Pagination } from './components/Pagination';
import { RefreshDropdown } from './components/RefreshDropdown';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useNewsFiltersWithApi } from './hooks/useNewsFiltersWithApi';
import { useAutoRefresh } from './hooks/useAutoRefresh';

function App() {
  const { theme, setTheme } = useTheme();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const {
    filters,
    onFiltersChange,
    categories,
    apiCategories,
    paginatedNews,
    currentPage,
    totalPages,
    onPageChange,
    onRefresh,
    onUpdateNews,
    totalResults,
    loading,
    error,
    isUpdating
  } = useNewsFiltersWithApi();

  // Анимация переключения страниц
  const handlePageChangeWithAnimation = (page: number) => {
    setIsPageTransitioning(true);
    // Увеличиваем время для завершения волновой анимации (5 ячеек * 30ms + запас)
    setTimeout(() => {
      onPageChange(page);
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 150);
    }, 200);
  };

  // Сброс анимации при изменении фильтров
  useEffect(() => {
    setIsPageTransitioning(false);
  }, [filters]);

  // Auto-refresh functionality
  const { timeUntilRefresh, isRefreshing } = useAutoRefresh({
    refreshInterval: filters.refreshInterval,
    onRefresh: onRefresh,
    isEnabled: true
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Newspaper className="w-10 h-10 text-[var(--text-primary)]" />
              <h1 className="text-4xl font-bold text-[var(--text-primary)]">Новости</h1>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle
                currentTheme={theme}
                onThemeChange={setTheme}
              />
              <RefreshDropdown
                value={filters.refreshInterval}
                onChange={(value) => onFiltersChange({ ...filters, refreshInterval: value })}
                timeUntilRefresh={timeUntilRefresh}
                isRefreshing={isRefreshing}
                onManualRefresh={onUpdateNews}
              />
            </div>
          </div>

          <div className="flex gap-6 items-start justify-start flex-1">
            <aside className="w-80 flex-shrink-0">
              <NewsFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                categories={categories}
                apiCategories={apiCategories}
              />
            </aside>

            <main className="flex-1 min-w-0 relative">
              <div className="mb-3 text-[var(--text-tertiary)] text-sm mt-3">
                Найдено новостей: {totalResults}
                {loading && <span className="ml-2 text-blue-500">Загрузка...</span>}
                {error && <span className="ml-2 text-red-500">Ошибка: {error}</span>}
                {isUpdating && <span className="ml-2 text-yellow-500">Обновление...</span>}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 min-h-[600px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-primary)]"></div>
                  <p className="text-[var(--text-tertiary)] text-lg text-center mt-4">Загрузка новостей...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 min-h-[600px]">
                  <p className="text-red-500 text-lg text-center">Ошибка загрузки новостей</p>
                  <p className="text-[var(--text-tertiary)] mt-2 text-center">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="mt-4 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : paginatedNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 min-h-[600px]">
                  <p className="text-[var(--text-tertiary)] text-lg text-center">Новости не найдены</p>
                  <p className="text-[var(--text-tertiary)] mt-2 text-center">Попробуйте изменить параметры поиска</p>
                </div>
              ) : (
                <>
                  <div className="pb-16 space-y-4">
                    {paginatedNews.map((news, index) => (
                      <div
                        key={news.id}
                        className={`transition-all duration-200 ease-in-out ${
                          isPageTransitioning 
                            ? 'opacity-0 transform translate-y-2 scale-98' 
                            : 'opacity-100 transform translate-y-0 scale-100'
                        }`}
                        style={{
                          transitionDelay: isPageTransitioning 
                            ? `${index * 30}ms` 
                            : `${index * 30 + 100}ms`
                        }}
                      >
                        <NewsCard 
                          news={news} 
                        />
                      </div>
                    ))}
                    
                    {/* Невидимые ячейки-заглушки для заполнения пустого места */}
                    {Array.from({ length: Math.max(0, 5 - paginatedNews.length) }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="h-36 opacity-0 pointer-events-none mb-4"
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChangeWithAnimation}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWithTheme;


