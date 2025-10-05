"""
Главный модуль новостного агрегатора
"""
import yaml
import json
from pathlib import Path
import logging
from typing import Dict, Any
from rss_parser import RSSParser
from summarizer import NewsSummarizer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class NewsAggregator:
    def __init__(self, config_path: str = 'config.yaml'):
        """
        Инициализация агрегатора
        
        Args:
            config_path: Путь к файлу конфигурации
        """
        self.config = self._load_config(config_path)
        self.parser = RSSParser(
            max_news_per_source=self.config['news']['max_news_per_source']
        )
        self.summarizer = NewsSummarizer(self.config['api'])
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """
        Загрузка конфигурации из YAML файла
        
        Args:
            config_path: Путь к файлу конфигурации
            
        Returns:
            Словарь с конфигурацией
        """
        logger.info(f"Загрузка конфигурации из {config_path}")
        
        config_file = Path(config_path)
        if not config_file.exists():
            raise FileNotFoundError(f"Конфигурационный файл не найден: {config_path}")
        
        with open(config_file, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        
        logger.info("Конфигурация успешно загружена")
        return config
    
    def run(self):
        """Основной метод запуска агрегатора"""
        logger.info("=" * 80)
        logger.info("TU TU RU RU max verstappen TU TU RU RU")
        logger.info("=" * 80)
        
        # Шаг 1: Парсинг RSS источников
        logger.info("\n[ШАГ 1] Парсинг RSS источников...")
        news_by_category = self.parser.parse_all_sources(
            self.config['rss_sources']
        )
        
        # Получаем плоский список всех новостей
        all_news = self.parser.get_all_news_flat(news_by_category)
        logger.info(f"Всего собрано новостей: {len(all_news)}")
        
        if not all_news:
            logger.warning("Новости не найдены! Завершение работы.")
            return
        
        # Шаг 2: Суммаризация новостей
        logger.info("\n[ШАГ 2] Суммаризация новостей...")
        summarized_news = self.summarizer.summarize_all_news(all_news)
        
        # Шаг 3: Выбор топ-новостей дня
        logger.info("\n[ШАГ 3] Выбор топ-новостей дня...")
        top_news = self.summarizer.select_top_news(
            summarized_news,
            top_count=self.config['news']['top_news_count']
        )
        
        # Шаг 4: Вывод результатов
        logger.info("\n[ШАГ 4] Формирование отчета...")
        self._print_results(news_by_category, summarized_news, top_news)
        
        # Сохранение результатов в JSON
        self._save_results(news_by_category, summarized_news, top_news)
        
        logger.info("\n" + "=" * 80)
        logger.info("РАБОТА АГРЕГАТОРА ЗАВЕРШЕНА")
        logger.info("=" * 80)
    
    def _print_results(self, news_by_category, summarized_news, top_news):
        """
        Вывод результатов работы агрегатора
        
        Args:
            news_by_category: Новости по категориям
            summarized_news: Все суммаризированные новости
            top_news: Топ-новости дня
        """
        print("\n" + "=" * 80)
        print("ОТЧЕТ О НОВОСТЯХ")
        print("=" * 80)
        
        # Статистика по категориям
        print("\n📊 СТАТИСТИКА ПО КАТЕГОРИЯМ:")
        for category, news_list in news_by_category.items():
            print(f"  • {category.capitalize()}: {len(news_list)} новостей")
        
        # Топ-новости дня
        print("\n" + "🔥" * 40)
        print(f"ТОП-{len(top_news)} НОВОСТЕЙ ДНЯ")
        print("🔥" * 40)
        
        for i, news in enumerate(top_news, 1):
            print(f"\n{i}. [{news.get('category', 'общее').upper()}] {news.get('title', '')}")
            print(f"   Источник: {news.get('source', '')}")
            print(f"   Дата: {news.get('published', '')}")
            print(f"   Ссылка: {news.get('link', '')}")
            print(f"   📝 Резюме: {news.get('summary', '')}")
        
        # Все новости по категориям
        print("\n" + "=" * 80)
        print("ВСЕ НОВОСТИ ПО КАТЕГОРИЯМ")
        print("=" * 80)
        
        for category, news_list in news_by_category.items():
            print(f"\n📁 КАТЕГОРИЯ: {category.upper()}")
            print("-" * 80)
            
            # Находим суммаризированные версии новостей из этой категории
            category_summarized = [
                n for n in summarized_news 
                if n.get('category') == category
            ]
            
            for i, news in enumerate(category_summarized, 1):
                print(f"\n{i}. {news.get('title', '')}")
                print(f"   Источник: {news.get('source', '')}")
                print(f"   Дата: {news.get('published', '')}")
                print(f"   Ссылка: {news.get('link', '')}")
                print(f"   📝 Резюме: {news.get('summary', '')}")
    
    def _save_results(self, news_by_category, summarized_news, top_news):
        """
        Сохранение результатов в JSON файлы
        
        Args:
            news_by_category: Новости по категориям
            summarized_news: Все суммаризированные новости
            top_news: Топ-новости дня
        """
        output_dir = Path('output')
        output_dir.mkdir(exist_ok=True)
        
        # Сохраняем все новости
        with open(output_dir / 'all_news.json', 'w', encoding='utf-8') as f:
            json.dump(summarized_news, f, ensure_ascii=False, indent=2)
        
        # Сохраняем топ-новости
        with open(output_dir / 'top_news.json', 'w', encoding='utf-8') as f:
            json.dump(top_news, f, ensure_ascii=False, indent=2)
        
        # Сохраняем новости по категориям
        with open(output_dir / 'news_by_category.json', 'w', encoding='utf-8') as f:
            # Преобразуем в суммаризированные версии
            categorized_summarized = {}
            for category, news_list in news_by_category.items():
                categorized_summarized[category] = [
                    n for n in summarized_news 
                    if n.get('category') == category
                ]
            json.dump(categorized_summarized, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Результаты сохранены в папку: {output_dir}")


def main():
    """Точка входа в приложение"""
    try:
        aggregator = NewsAggregator(config_path='config.yaml')
        aggregator.run()
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}", exc_info=True)
        raise


if __name__ == '__main__':
    main()
