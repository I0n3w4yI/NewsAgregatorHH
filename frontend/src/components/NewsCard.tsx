import { NewsItem } from '../types/news';

interface NewsCardProps {
  news: NewsItem;
  onOpenModal: (news: NewsItem) => void;
}

export function NewsCard({ news, onOpenModal }: NewsCardProps) {
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
    <button
      onClick={() => onOpenModal(news)}
      className="w-full text-left group"
    >
      <div className="bg-[#101010] border border-white rounded-lg p-4 transition-all duration-300 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-800/50 hover:translate-y-[-1px] h-32 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2 h-6">
              <span className="text-gray-300 font-semibold text-sm">
                {news.category}
              </span>
              {news.subcategory && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-sm">
                    {news.subcategory}
                  </span>
                </>
              )}
              <span className="text-gray-500 text-sm ml-auto">
                {formatDate(news.date)}
              </span>
            </div>

            <p className="text-gray-200 text-base leading-relaxed flex-1 overflow-hidden" style={{
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

