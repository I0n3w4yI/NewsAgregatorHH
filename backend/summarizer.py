import os
import asyncio
from typing import Dict, Any, List
import logging
import time
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NewsSummarizer:
    """Класс для суммаризации новостей через OpenAI API"""
    
    def __init__(self, api_config: Dict[str, Any]):
        """
        Инициализация суммаризатора
        
        Args:
            api_config: Конфигурация API из config.yaml
        """
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            logger.warning("API ключ для OpenAI не найден в переменных окружения")
        
        # Инициализируем OpenAI клиент
        self.client = AsyncOpenAI(api_key=self.api_key)
        
        # Настройки из конфигурации
        self.model = api_config.get('openai', {}).get('model', 'gpt-5-nano')
        self.temperature = api_config.get('openai', {}).get('temperature', 0.7)
        self.max_tokens = api_config.get('openai', {}).get('max_tokens', 500)
    
    async def translate_title(self, title: str) -> str:
        """
        Перевод заголовка новости на русский язык
        
        Args:
            title: Заголовок новости
            
        Returns:
            Переведенный заголовок
        """
        if not title or not self.api_key:
            return title
            
        # Проверяем, нужен ли перевод (если уже на русском или пустой)
        if self._is_russian_text(title):
            return title
            
        prompt = f"""Переведи следующий заголовок новости на русский язык. Сохрани смысл и стиль заголовка.

ЗАГОЛОВОК: {title}

ИНСТРУКЦИИ:
- Переведи точно и естественно на русский язык
- Не добавляй лишних слов
- Сохрани эмоциональную окраску заголовка
- Если заголовок уже на русском языке, верни его без изменений
- Используй современную русскую лексику

ОТВЕТ (только переведенный заголовок):"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Низкая температура для более точного перевода
                max_tokens=200
            )
            
            translated_title = response.choices[0].message.content.strip()
            return translated_title
            
        except Exception as e:
            logger.error(f"Ошибка при переводе заголовка: {e}")
            return title  # Возвращаем оригинальный заголовок при ошибке
    
    def _is_russian_text(self, text: str) -> bool:
        """
        Проверяет, является ли текст русским
        
        Args:
            text: Текст для проверки
            
        Returns:
            True если текст на русском языке
        """
        if not text:
            return True
            
        # Подсчитываем количество русских символов
        russian_chars = sum(1 for char in text if '\u0400' <= char <= '\u04FF')
        # Подсчитываем количество латинских символов
        latin_chars = sum(1 for char in text if char.isalpha() and ('\u0041' <= char <= '\u005A' or '\u0061' <= char <= '\u007A'))
        total_alpha_chars = sum(1 for char in text if char.isalpha())
        
        # Если нет букв вообще, считаем русским
        if total_alpha_chars == 0:
            return True
            
        # Если больше латинских символов чем русских, считаем не русским
        if latin_chars > russian_chars:
            return False
            
        # Если больше 30% русских символов от всех букв, считаем русским
        return russian_chars / total_alpha_chars > 0.3

    async def summarize_news(self, news_item: Dict[str, Any]) -> str:
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
Создай структурированное резюме (1-2 предложения), которое включает:
1. Основную суть новости (что произошло?)
2. Ключевые детали и факты
3. Кто вовлечен (люди, компании, организации)
4. Когда и где (если указано)
5. Почему это важно или какие последствия

Резюме должно быть информативным, точным и легко читаемым. Пиши на русском языке.
НЕ НАЧИНАЙ с слова "Резюме" или "Краткое содержание" - сразу пиши суть новости."""
        
        try:
            start_time = time.time()
            result = await self._summarize_openai(prompt)
            end_time = time.time()
            logger.info(f"Суммаризация заняла {end_time - start_time:.2f} секунд")
            return result
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
    
    async def _summarize_openai(self, prompt: str) -> str:
        """Суммаризация через OpenAI API"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
            
        except Exception as e:
            logger.error(f"Ошибка при обращении к OpenAI API: {e}")
            raise e
    
    async def summarize_all_news(self, news_list: List[Dict[str, Any]], batch_size: int = 5) -> List[Dict[str, Any]]:
        """
        Batch суммаризация всех новостей через OpenAI API
        
        Args:
            news_list: Список новостей для суммаризации
            batch_size: Размер батча для обработки
            
        Returns:
            Список новостей с добавленными суммаризациями
        """
        if not self.api_key:
            logger.warning("API ключ не найден, пропускаем суммаризацию")
            return news_list
        
        logger.info(f"Начинаем batch суммаризацию {len(news_list)} новостей (батчи по {batch_size})...")
        start_time = time.time()
        
        # Разделяем новости на батчи
        batches = [news_list[i:i + batch_size] for i in range(0, len(news_list), batch_size)]
        logger.info(f"Создано {len(batches)} батчей")
        
        # Асинхронная обработка всех батчей одновременно
        logger.info(f"Запускаем асинхронную обработку {len(batches)} батчей...")
        
        async def process_batch_with_error_handling(batch, batch_index):
            try:
                logger.info(f"Обрабатываем батч {batch_index + 1}/{len(batches)} ({len(batch)} новостей)")
                return await self._summarize_batch(batch, batch_index)
            except Exception as e:
                logger.error(f"Ошибка при обработке батча {batch_index + 1}: {e}")
                # Возвращаем новости без суммаризации
                result = []
                for news in batch:
                    news_copy = news.copy()
                    news_copy['summary'] = f"Ошибка batch суммаризации: {str(e)}"
                    result.append(news_copy)
                return result
        
        # Создаем задачи для всех батчей
        tasks = [process_batch_with_error_handling(batch, batch_index) for batch_index, batch in enumerate(batches)]
        
        # Выполняем все батчи параллельно
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Объединяем результаты
        all_summarized_news = []
        for result in batch_results:
            if isinstance(result, Exception):
                logger.error(f"Батч завершился с ошибкой: {result}")
                continue
            all_summarized_news.extend(result)
        
        end_time = time.time()
        logger.info(f"Batch суммаризация завершена за {end_time - start_time:.2f} секунд (в среднем {(end_time - start_time)/len(news_list):.2f} сек/новость)")
        
        # Финальная проверка: убеждаемся, что все английские заголовки переведены
        logger.info("Проводим финальную проверку переводов...")
        for i, news in enumerate(all_summarized_news):
            title = news.get('title', '')
            if not self._is_russian_text(title):
                logger.warning(f"Найден непереведенный заголовок #{i+1}: '{title}'")
                try:
                    translated_title = await self.translate_title(title)
                    news['title'] = translated_title
                    logger.info(f"Исправлен перевод заголовка #{i+1}: '{title}' -> '{translated_title}'")
                except Exception as e:
                    logger.error(f"Не удалось исправить перевод заголовка #{i+1}: {e}")
        
        return all_summarized_news
    
    async def _summarize_batch(self, news_batch: List[Dict[str, Any]], batch_index: int) -> List[Dict[str, Any]]:
        """
        Batch суммаризация группы новостей через один запрос к OpenAI API
        
        Args:
            news_batch: Батч новостей для суммаризации
            batch_index: Индекс батча для логирования
            
        Returns:
            Список новостей с суммаризациями и переведенными заголовками
        """
        # Формируем промпт для batch обработки
        news_texts = []
        for i, news in enumerate(news_batch):
            title = news.get('title', '')
            description = news.get('description', '')
            news_texts.append(f"НОВОСТЬ {i+1}:\nЗаголовок: {title}\nСодержание: {description}\n")
        
        batch_prompt = f"""Ты - профессиональный журналист и переводчик. Проанализируй следующие {len(news_batch)} новостей и выполни две задачи:

{''.join(news_texts)}

ЗАДАЧИ:
1. Переведи заголовки на русский язык (если они не на русском)
2. Создай краткие резюме на русском языке для каждой новости (2-3 предложения)

ИНСТРУКЦИИ ДЛЯ ПЕРЕВОДА ЗАГОЛОВКОВ:
- Если заголовок уже на русском языке, оставь его без изменений
- Переведи точно и естественно на русский язык
- Сохрани эмоциональную окраску и стиль заголовка
- Используй современную русскую лексику
- Не добавляй лишних слов

ИНСТРУКЦИИ ДЛЯ РЕЗЮМЕ:
- Пиши информативно и структурированно
- Включи ключевые факты и детали
- Укажи кто, что, когда, где и почему
- Используй понятный русский язык

ФОРМАТ ОТВЕТА:
ЗАГОЛОВКИ:
1. [переведенный заголовок первой новости]
2. [переведенный заголовок второй новости]
...
{len(news_batch)}. [переведенный заголовок последней новости]

РЕЗЮМЕ:
1. [резюме первой новости]
2. [резюме второй новости]
...
{len(news_batch)}. [резюме последней новости]

ВАЖНО: 
- Используй только нумерованные списки без дополнительных слов
- Строго следуй формату ответа"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": batch_prompt}
                ]
            )
            
            batch_response = response.choices[0].message.content.strip()
            
            # Парсим ответ и извлекаем заголовки и резюме для каждой новости
            parsed_data = self._parse_batch_response(batch_response, len(news_batch))
            translated_titles = parsed_data.get('titles', [])
            summaries = parsed_data.get('summaries', [])
            
            # Добавляем переведенные заголовки и резюме к новостям
            result_news = []
            for i, news in enumerate(news_batch):
                news_copy = news.copy()
                
                # Проверяем, нужен ли перевод заголовка
                original_title = news.get('title', '')
                if not self._is_russian_text(original_title):
                    # Если заголовок не русский, используем переведенный
                    if i < len(translated_titles) and translated_titles[i]:
                        news_copy['title'] = translated_titles[i]
                        logger.info(f"Переведен заголовок: '{original_title}' -> '{translated_titles[i]}'")
                    else:
                        # Fallback: пытаемся перевести отдельно
                        try:
                            translated_title = await self.translate_title(original_title)
                            news_copy['title'] = translated_title
                            logger.info(f"Fallback перевод заголовка: '{original_title}' -> '{translated_title}'")
                        except Exception as e:
                            logger.warning(f"Не удалось перевести заголовок '{original_title}': {e}")
                            news_copy['title'] = original_title
                else:
                    # Заголовок уже на русском, оставляем как есть
                    news_copy['title'] = original_title
                    logger.info(f"Заголовок уже на русском: '{original_title}'")
                
                # Добавляем резюме
                summary = summaries[i] if i < len(summaries) else f"{news_copy['title']}. {news.get('description', '')[:200]}..."
                
                # Проверяем, нужно ли переводить резюме
                if not self._is_russian_text(summary):
                    logger.warning(f"Резюме на английском языке, пытаемся перевести: '{summary[:100]}...'")
                    try:
                        # Создаем простой промпт для перевода резюме
                        translate_prompt = f"""Переведи следующее резюме новости на русский язык:

РЕЗЮМЕ: {summary}

Переведи точно и естественно на русский язык, сохранив смысл и структуру."""
                        
                        translate_response = await self.client.chat.completions.create(
                            model=self.model,
                            messages=[{"role": "user", "content": translate_prompt}],
                            temperature=0.3,
                            max_tokens=300
                        )
                        
                        translated_summary = translate_response.choices[0].message.content.strip()
                        news_copy['summary'] = translated_summary
                        logger.info(f"Переведено резюме: '{summary[:50]}...' -> '{translated_summary[:50]}...'")
                    except Exception as e:
                        logger.error(f"Не удалось перевести резюме: {e}")
                        news_copy['summary'] = summary
                else:
                    news_copy['summary'] = summary
                result_news.append(news_copy)
            
            return result_news
            
        except Exception as e:
            logger.error(f"Ошибка при batch суммаризации батча {batch_index + 1}: {e}")
            # Возвращаем новости с fallback резюме и принудительным переводом заголовков
            result_news = []
            for news in news_batch:
                news_copy = news.copy()
                
                # Принудительно переводим заголовок, если он не русский
                original_title = news.get('title', '')
                if not self._is_russian_text(original_title):
                    try:
                        translated_title = await self.translate_title(original_title)
                        news_copy['title'] = translated_title
                        logger.info(f"Fallback перевод заголовка: '{original_title}' -> '{translated_title}'")
                    except Exception as translate_error:
                        logger.error(f"Не удалось перевести заголовок в fallback: {translate_error}")
                        news_copy['title'] = original_title
                
                # Создаем базовое резюме
                news_copy['summary'] = f"{news_copy['title']}. {news.get('description', '')[:200]}..."
                result_news.append(news_copy)
            return result_news
    
    def _parse_batch_response(self, response: str, expected_count: int) -> Dict[str, List[str]]:
        """
        Парсинг ответа от batch суммаризации с заголовками и резюме
        
        Args:
            response: Ответ от LLM
            expected_count: Ожидаемое количество резюме
            
        Returns:
            Словарь с заголовками и резюме
        """
        logger.info(f"Парсинг batch ответа для {expected_count} новостей")
        logger.info(f"Ответ LLM: {response[:500]}...")
        
        titles = []
        summaries = []
        
        # Разделяем ответ на секции заголовков и резюме
        lines = response.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Определяем секцию
            if 'ЗАГОЛОВКИ:' in line.upper() or 'ЗАГОЛОВКИ' in line.upper():
                current_section = 'titles'
                continue
            elif 'РЕЗЮМЕ:' in line.upper() or 'РЕЗЮМЕ' in line.upper():
                current_section = 'summaries'
                continue
            
            # Парсим нумерованные элементы (поддерживаем разные форматы)
            if line and line[0].isdigit():
                # Извлекаем номер и содержимое
                parts = line.split('.', 1)
                if len(parts) > 1:
                    content = parts[1].strip()
                    if content:  # Проверяем, что содержимое не пустое
                        if current_section == 'titles':
                            titles.append(content)
                        elif current_section == 'summaries':
                            summaries.append(content)
                # Также пробуем формат "1: текст"
                elif ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) > 1:
                        content = parts[1].strip()
                        if content:
                            if current_section == 'titles':
                                titles.append(content)
                            elif current_section == 'summaries':
                                summaries.append(content)
        
        # Если не удалось найти секции, пытаемся парсить как старый формат
        if not titles and not summaries:
            logger.warning("Не удалось найти секции заголовков и резюме, используем старый формат")
            summaries = self._parse_old_format(response, expected_count)
        
        logger.info(f"Найдено {len(titles)} заголовков и {len(summaries)} резюме из {expected_count} ожидаемых")
        
        return {
            'titles': titles,
            'summaries': summaries
        }
    
    def _parse_old_format(self, response: str, expected_count: int) -> List[str]:
        """
        Парсинг ответа в старом формате (только резюме)
        
        Args:
            response: Ответ от LLM
            expected_count: Ожидаемое количество резюме
            
        Returns:
            Список резюме
        """
        
        summaries = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            # Парсим формат "1. текст", "2. текст" и т.д.
            if line and line[0].isdigit() and '. ' in line:
                # Извлекаем текст после точки и пробела
                summary = line.split('. ', 1)[1].strip()
                if summary:
                    summaries.append(summary)
                    logger.info(f"Найдено резюме (формат N.): {summary[:100]}...")
            # Также пробуем парсить формат "1: текст" для совместимости
            elif line and line[0].isdigit() and ':' in line:
                summary = line.split(':', 1)[1].strip()
                if summary:
                    summaries.append(summary)
                    logger.info(f"Найдено резюме (формат N:): {summary[:100]}...")
        
        logger.info(f"Найдено {len(summaries)} резюме из {expected_count} ожидаемых")
        
        # Если не удалось распарсить достаточно резюме, создаем fallback
        while len(summaries) < expected_count:
            summaries.append("Резюме недоступно")
        
        return summaries[:expected_count]
    
    async def select_top_news(self, news_list: List[Dict[str, Any]], top_count: int = 5) -> List[Dict[str, Any]]:
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
            response = await self._summarize_openai(prompt)
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