import os
import requests
from typing import Dict, Any, List
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NewsSummarizer:
    """Класс для суммаризации новостей через LLM API"""
    
    def __init__(self, api_config: Dict[str, Any]):
        """
        Инициализация суммаризатора
        
        Args:
            api_config: Конфигурация API из config.yaml
        """
        self.provider = 'openrouter'
        self.config = api_config.get('openrouter', {})
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        if not self.api_key:
            logger.warning("API ключ для Openrouter не найден в переменных окружения")
    
    def summarize_news(self, news_item: Dict[str, Any]) -> str:
        """
        Суммаризация одной новости
        
        Args:
            news_item: Словарь с данными новости
            
        Returns:
            Краткая суммаризация новости
        """
        title = news_item.get('title', '')
        description = news_item.get('description', '')
        
        prompt = f"""Ты - профессиональный журналист. Проанализируй следующую новость и создай подробное, информативное резюме на русском языке.

НОВОСТЬ:
Заголовок: {title}

Полное содержание:
{description}

ЗАДАЧА:
Создай структурированное резюме (3-5 предложений), которое включает:
1. Основную суть новости (что произошло?)
2. Ключевые детали и факты
3. Кто вовлечен (люди, компании, организации)
4. Когда и где (если указано)
5. Почему это важно или какие последствия

Резюме должно быть информативным, точным и легко читаемым. Пиши на русском языке.

РЕЗЮМЕ:"""
        
        try:
            return self._summarize_openrouter(prompt)
        except Exception as e:
            logger.error(f"Ошибка при суммаризации: {e}")
            # Fallback - создаем более качественное базовое резюме
            summary = f"{title}. "
            if description:
                # Берем первые 500 символов для более полного резюме
                summary += description[:500]
                if len(description) > 500:
                    summary += "..."
            return summary
    
    def _summarize_openrouter(self, prompt: str) -> str:
        """Суммаризация через OpenRouter API"""
        url = f"{self.config.get('base_url')}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.config.get('model'),
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": self.config.get('temperature', 0.7),
            "max_tokens": self.config.get('max_tokens', 500)
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        summary = result['choices'][0]['message']['content'].strip()
        return summary
    

    
    def summarize_all_news(self, news_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Суммаризация списка новостей
        
        Args:
            news_list: Список новостей для суммаризации
            
        Returns:
            Список новостей с добавленным полем 'summary'
        """
        logger.info(f"Начинаем суммаризацию {len(news_list)} новостей...")
        
        summarized_news = []
        for i, news in enumerate(news_list, 1):
            logger.info(f"Суммаризация новости {i}/{len(news_list)}: {news.get('title', '')[:50]}...")
            summary = self.summarize_news(news)
            news_copy = news.copy()
            news_copy['summary'] = summary
            summarized_news.append(news_copy)
        
        logger.info("Суммаризация завершена")
        return summarized_news
    
    def select_top_news(self, news_list: List[Dict[str, Any]], top_count: int = 5) -> List[Dict[str, Any]]:
        """
        Выбор самых интересных новостей дня с помощью LLM
        
        Args:
            news_list: Список всех новостей с суммаризацией
            top_count: Количество топ-новостей
            
        Returns:
            Список топ-новостей
        """
        logger.info(f"Выбираем топ-{top_count} новостей из {len(news_list)}...")
        
        news_summaries = []
        for i, news in enumerate(news_list):
            news_summaries.append(
                f"{i+1}. [{news.get('category', 'общее').upper()}] {news.get('title', '')}\n"
                f"   📝 {news.get('summary', '')}\n"
                f"   📍 Источник: {news.get('source', '')}\n\n"
            )
        
        prompt = f"""Ты - опытный редактор новостного агентства. Проанализируй следующие {len(news_list)} новостей и выбери {top_count} САМЫХ ИНТЕРЕСНЫХ и ЗНАЧИМЫХ новостей дня.

КРИТЕРИИ ВЫБОРА:
1. Актуальность и свежесть информации
2. Общественная значимость и влияние на людей
3. Уникальность и новизна информации
4. Интерес для широкой аудитории
5. Полнота и информативность

НОВОСТИ:
{''.join(news_summaries)}

ЗАДАЧА: Выбери {top_count} лучших новостей и укажи ТОЛЬКО их номера через запятую.
Например: 1, 5, 12, 18, 23

ОТВЕТ (только номера):"""
        
        try:
            response = self._summarize_openrouter(prompt)
            # Парсим ответ и извлекаем индексы
            selected_indices = []
            for part in response.replace(' ', '').split(','):
                try:
                    idx = int(part.strip()) - 1  # Преобразуем в 0-индексированный
                    if 0 <= idx < len(news_list):
                        selected_indices.append(idx)
                except ValueError:
                    continue
            # Если LLM не вернул корректный ответ, берем первые top_count новостей
            if len(selected_indices) < top_count:
                logger.warning("LLM не вернул достаточно индексов, берем первые новости")
                selected_indices = list(range(min(top_count, len(news_list))))
            selected_indices = selected_indices[:top_count]
            top_news = [news_list[i] for i in selected_indices]
            logger.info(f"Выбрано {len(top_news)} топ-новостей")
            return top_news
        except Exception as e:
            logger.error(f"Ошибка при выборе топ-новостей: {e}")
            return news_list[:top_count]
