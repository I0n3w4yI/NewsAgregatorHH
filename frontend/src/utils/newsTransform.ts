/**
 * Утилиты для преобразования данных API в формат фронтенда
 */

import { NewsItem, ApiNewsItem } from '../types/news';

/**
 * Проверяет, является ли текст русским
 */
export function isRussianText(text: string): boolean {
  if (!text) return true;
  
  // Подсчитываем количество русских символов
  const russianChars = (text.match(/[\u0400-\u04FF]/g) || []).length;
  // Подсчитываем количество латинских символов
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  const totalAlphaChars = russianChars + latinChars;
  
  // Если нет букв вообще, считаем русским
  if (totalAlphaChars === 0) return true;
  
  // Если больше латинских символов чем русских, считаем не русским
  if (latinChars > russianChars) return false;
  
  // Если больше 30% русских символов от всех букв, считаем русским
  return russianChars / totalAlphaChars > 0.3;
}

/**
 * Преобразует элемент новости из API в формат фронтенда
 */
export function transformApiNewsItem(apiItem: ApiNewsItem, index: number): NewsItem {
  // Определяем, какой текст использовать для отображения
  let displayText = apiItem.summary || apiItem.description;
  
  // Если текст на английском языке, добавляем пометку для пользователя
  if (!isRussianText(displayText)) {
    console.warn(`English text detected in news item ${index}:`, {
      title: apiItem.title,
      summary: apiItem.summary,
      description: apiItem.description
    });
    // Показываем оригинальный текст, но добавляем пометку в консоль для отладки
    // В будущем здесь можно добавить автоматический перевод
  }
  
  // Проверяем заголовок
  let displayTitle = apiItem.title;
  if (!isRussianText(displayTitle)) {
    console.warn(`English title detected in news item ${index}:`, displayTitle);
    // Показываем оригинальный заголовок, но добавляем пометку в консоль для отладки
  }
  
  return {
    id: `api-${index}-${Date.now()}`, // Генерируем уникальный ID
    category: apiItem.category,
    subcategory: undefined, // API не предоставляет подкатегории
    text: displayText,
    date: apiItem.published,
    sourceUrl: apiItem.link,
    title: displayTitle,
    fullContent: apiItem.description,
    author: apiItem.source,
    imageUrl: undefined, // API не предоставляет изображения
  };
}

/**
 * Преобразует массив новостей из API в формат фронтенда
 */
export function transformApiNewsItems(apiItems: ApiNewsItem[]): NewsItem[] {
  return apiItems.map((item, index) => transformApiNewsItem(item, index));
}

/**
 * Генерирует уникальный ID для новости
 */
export function generateNewsId(prefix: string = 'news'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Капитализирует первую букву строки
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Извлекает URL изображений из HTML-текста
 */
export function extractImagesFromHtml(html: string): string[] {
  if (!html) return [];
  
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}

/**
 * Удаляет изображения из HTML-текста
 */
export function removeImagesFromHtml(html: string): string {
  if (!html) return html;
  
  return html.replace(/<img[^>]*>/gi, '');
}

/**
 * Извлекает домен из URL
 */
export function extractDomainFromUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // Если URL невалидный, пытаемся извлечь домен вручную
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : url;
  }
}
