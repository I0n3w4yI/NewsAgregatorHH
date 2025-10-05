import feedparser
from typing import List, Dict, Any
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RSSParser:
    def __init__(self, max_news_per_source: int = 7):
        """
        Инициализация парсера
        
        Args:
            max_news_per_source: Максимальное количество новостей из источника
        """
        self.max_news_per_source = max_news_per_source
    
    def parse_feed(self, url: str, source_name: str) -> List[Dict[str, Any]]:
        """
        Парсинг одной RSS ленты
        
        Args:
            url: URL RSS ленты
            source_name: Название источника
            
        Returns:
            Список новостей из источника
        """
        try:
            logger.info(f"Парсинг {source_name} ({url})")
            feed = feedparser.parse(url)
            
            if feed.bozo:
                logger.warning(f"Возможные проблемы с RSS лентой {source_name}: {feed.bozo_exception}")
            
            news_list = []
            for entry in feed.entries[:self.max_news_per_source]:
                news_item = {
                    'title': entry.get('title', 'Без заголовка'),
                    'link': entry.get('link', ''),
                    'description': entry.get('summary', entry.get('description', '')),
                    'published': self._parse_date(entry),
                    'source': source_name,
                    'source_url': url
                }
                news_list.append(news_item)
            
            logger.info(f"Получено {len(news_list)} новостей из {source_name}")
            return news_list
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге {source_name}: {e}")
            return []
    
    def _parse_date(self, entry: Any) -> str:
        """
        Парсинг даты публикации
        
        Args:
            entry: Запись из RSS ленты
            
        Returns:
            Отформатированная дата или пустую строку
        """
        try:
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                dt = datetime(*entry.published_parsed[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                dt = datetime(*entry.updated_parsed[:6])
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        except Exception:
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    def parse_all_sources(self, sources_by_category: Dict[str, List[Dict[str, str]]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Парсинг всех источников по категориям
        
        Args:
            sources_by_category: Словарь источников по категориям
            
        Returns:
            Словарь новостей по категориям
        """
        all_news = {}
        
        for category, sources in sources_by_category.items():
            logger.info(f"Обработка категории: {category}")
            category_news = []
            
            for source in sources:
                url = source.get('url')
                name = source.get('name', 'Неизвестный источник')
                
                if url:
                    news = self.parse_feed(url, name)
                    for item in news:
                        item['category'] = category
                    category_news.extend(news)
            
            all_news[category] = category_news
            logger.info(f"Всего новостей в категории '{category}': {len(category_news)}")
        
        return all_news
    
    def get_all_news_flat(self, news_by_category: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Получить плоский список всех новостей
        
        Args:
            news_by_category: Новости по категориям
            
        Returns:
            Плоский список всех новостей
        """
        all_news = []
        for category_news in news_by_category.values():
            all_news.extend(category_news)
        return all_news
