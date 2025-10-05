import { NewsItem } from '../types/news';
import { ViewMode } from './ViewToggle';

interface NewsCardProps {
  news: NewsItem;
  onOpenModal: (news: NewsItem) => void;
  viewMode: ViewMode;
}

export function NewsCard({ news, onOpenModal, viewMode }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} мин. назад`;
    }

    if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    }

    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (viewMode === 'cards') {
    return (
      <button
        onClick={() => onOpenModal(news)}
        className="w-full text-left group"
      >
        <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-3 transition-all duration-300 hover:border-[var(--border-tertiary)] hover:shadow-lg hover:shadow-gray-800/50 hover:translate-y-[-1px] h-40 flex flex-col">
          <div className="flex items-start justify-between gap-3 flex-1">
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2 h-5">
                <span className="text-[var(--text-secondary)] font-semibold text-sm truncate">
                  {news.category}
                </span>
                {news.subcategory && (
                  <>
                    <span className="text-[var(--text-tertiary)]">•</span>
                    <span className="text-[var(--text-tertiary)] text-xs truncate">
                      {news.subcategory}
                    </span>
                  </>
                )}
                <span className="text-[var(--text-tertiary)] text-xs ml-auto flex-shrink-0">
                  {formatDate(news.date)}
                </span>
              </div>

              <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-1 line-clamp-1">
                {news.title}
              </h3>

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.4',
                textOverflow: 'ellipsis'
              }}>
                {news.text}
              </p>

              <div className="mt-2 text-[var(--text-tertiary)] text-xs truncate">
                {news.author}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // List view (original compact design)
  return (
    <button
      onClick={() => onOpenModal(news)}
      className="w-full text-left group"
    >
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-3 transition-all duration-300 hover:border-[var(--border-tertiary)] hover:shadow-lg hover:shadow-gray-800/50 hover:translate-y-[-1px] h-28 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-1 h-5">
              <span className="text-[var(--text-secondary)] font-semibold text-sm">
                {news.category}
              </span>
              {news.subcategory && (
                <>
                  <span className="text-[var(--text-tertiary)]">•</span>
                  <span className="text-[var(--text-tertiary)] text-sm">
                    {news.subcategory}
                  </span>
                </>
              )}
              <span className="text-[var(--text-tertiary)] text-sm ml-auto">
                {formatDate(news.date)}
              </span>
            </div>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed flex-1 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.5',
              textOverflow: 'ellipsis'
            }}>
              {news.text}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

