import { NewsItem } from '../types/news';
import { capitalizeFirstLetter } from '../utils/newsTransform';
import { HtmlRenderer } from './HtmlRenderer';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
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

  return (
    <a
      href={news.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-left group block"
    >
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 pt-3 pb-2 transition-all duration-300 hover:border-[var(--border-tertiary)] hover:shadow-lg hover:shadow-gray-800/50 hover:translate-y-[-1px] h-36 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-1 h-5">
              <span className="text-[var(--text-secondary)] font-semibold text-sm">
                {capitalizeFirstLetter(news.category)}
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

            <div className="text-[var(--text-secondary)] text-base leading-relaxed flex-1 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4',
              textOverflow: 'ellipsis'
            }}>
              <HtmlRenderer 
                html={news.text} 
                maxLength={300}
                showImages={false}
              />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

