import React from 'react';
import { removeImagesFromHtml } from '../utils/newsTransform';

interface HtmlRendererProps {
  html: string;
  className?: string;
  maxLength?: number;
  showImages?: boolean;
}

export function HtmlRenderer({ 
  html, 
  className = '', 
  maxLength,
  showImages = true 
}: HtmlRendererProps) {
  // Функция для очистки и ограничения HTML
  const processHtml = (htmlString: string): string => {
    if (!htmlString) return '';
    
    let processed = htmlString;
    
    // Всегда удаляем изображения из текста, так как они будут отображаться отдельно
    processed = removeImagesFromHtml(processed);
    
    // Заменяем теги <p> на <div> с правильными стилями для отображения параграфов
    processed = processed.replace(/<p([^>]*)>/g, '<div$1 style="margin-bottom: 1.5rem; margin-top: 0; line-height: 1.6; display: block;">');
    processed = processed.replace(/<\/p>/g, '</div>');
    
    // Если указана максимальная длина, обрезаем текст
    if (maxLength && processed.length > maxLength) {
      // Находим последний закрывающий тег перед maxLength
      const truncated = processed.substring(0, maxLength);
      const lastTagIndex = truncated.lastIndexOf('</');
      if (lastTagIndex > -1) {
        const tagName = truncated.substring(truncated.lastIndexOf('<') + 1, lastTagIndex);
        processed = truncated.substring(0, lastTagIndex) + `</${tagName}>...`;
      } else {
        processed = truncated + '...';
      }
    }
    
    return processed;
  };

  // Функция для безопасного рендеринга HTML
  const createMarkup = (htmlString: string) => {
    const processedHtml = processHtml(htmlString);
    return { __html: processedHtml };
  };

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={createMarkup(html)}
    />
  );
}
