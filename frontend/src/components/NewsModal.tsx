import { X, ExternalLink, Calendar, User } from 'lucide-react';
import { NewsItem } from '../types/news';

interface NewsModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsModal({ news, isOpen, onClose }: NewsModalProps) {
  if (!isOpen || !news) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-[#101010] border border-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-gray-300 font-semibold text-sm bg-gray-800 px-3 py-1 rounded-full">
              {news.category}
            </span>
            {news.subcategory && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
                  {news.subcategory}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* Image */}
          {news.imageUrl && (
            <div className="w-full h-48 bg-gray-800">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
              {news.title}
            </h1>

            {/* Meta information */}
            <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{news.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(news.date)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                {news.text}
              </p>
              
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {news.fullContent}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50 gap-4 flex-shrink-0">
          <div className="text-sm text-gray-400 flex-1 min-w-0">
            <span className="block sm:inline">Источник: </span>
            <span className="break-all">{news.sourceUrl}</span>
          </div>
          <a
            href={news.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-[#101010] rounded-lg hover:bg-gray-300 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Открыть оригинал</span>
            <span className="sm:hidden">Оригинал</span>
          </a>
        </div>
      </div>
    </div>
  );
}
