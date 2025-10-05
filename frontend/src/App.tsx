import { Newspaper, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NewsCard } from './components/NewsCard';
import { NewsFilters } from './components/NewsFilters';
import { NewsModal } from './components/NewsModal';
import { Pagination } from './components/Pagination';
import { RefreshDropdown } from './components/RefreshDropdown';
import { useNewsFilters } from './hooks/useNewsFilters';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { mockNewsData } from './data/mockData';
import { NewsItem } from './types/news';

function App() {
  const {
    filters,
    onFiltersChange,
    categories,
    paginatedNews,
    currentPage,
    totalPages,
    onPageChange,
    onRefresh,
    totalResults
  } = useNewsFilters(mockNewsData);

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const handleOpenModal = (news: NewsItem) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

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
    <div className="min-h-screen bg-[#101010] flex flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Newspaper className="w-10 h-10 text-white" />
              <h1 className="text-4xl font-bold text-white">Новости</h1>
            </div>
            
            {/* Refresh controls */}
            <div className="flex items-center gap-4">
            <RefreshDropdown
              value={filters.refreshInterval}
              onChange={(value) => onFiltersChange({ ...filters, refreshInterval: value })}
              timeUntilRefresh={timeUntilRefresh}
              isRefreshing={isRefreshing}
              onManualRefresh={onRefresh}
            />
            </div>
          </div>

          <div className="flex gap-6 items-start justify-center flex-1">
            <aside className="w-80 flex-shrink-0">
              <NewsFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                categories={categories}
              />
            </aside>

            <main className="flex-1 min-w-0 max-w-4xl relative">
              <div className="mb-3 text-gray-400 text-sm mt-3">
                Найдено новостей: {totalResults}
              </div>

              {paginatedNews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">Новости не найдены</p>
                  <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 pb-16">
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
                          onOpenModal={handleOpenModal}
                        />
                      </div>
                    ))}
                    
                    {/* Невидимые ячейки-заглушки для заполнения пустого места */}
                    {Array.from({ length: Math.max(0, 5 - paginatedNews.length) }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="h-32 opacity-0 pointer-events-none"
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

      {/* News Modal */}
      <NewsModal
        news={selectedNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;

