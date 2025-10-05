"""
FastAPI сервер для предоставления новостей фронтенду
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import yaml
import logging
import asyncio
from pathlib import Path
import json
from datetime import datetime
from pydantic import BaseModel

from rss_parser import RSSParser
from summarizer import NewsSummarizer

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title="News Aggregator API",
    description="API для агрегации и суммаризации новостей из RSS источников",
    version="1.0.0"
)

# CORS middleware для доступа с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные переменные для кэша
news_cache = {
    "all_news": [],
    "top_news": [],
    "news_by_category": {},
    "last_update": None,
    "is_updating": False
}


# Pydantic модели для API
class NewsItem(BaseModel):
    title: str
    link: str
    description: str
    published: str
    source: str
    source_url: str
    category: str
    summary: Optional[str] = None


class NewsResponse(BaseModel):
    news: List[NewsItem]
    total: int
    last_update: Optional[str]


class CategoryNews(BaseModel):
    category: str
    news: List[NewsItem]
    count: int


class StatsResponse(BaseModel):
    total_news: int
    categories_count: int
    sources_count: int
    last_update: Optional[str]
    categories: Dict[str, int]


def load_config():
    config_path = Path('config.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def load_cached_news():
    output_dir = Path('output')
    
    if not output_dir.exists():
        return None
    
    try:
        all_news_path = output_dir / 'all_news.json'
        if all_news_path.exists():
            with open(all_news_path, 'r', encoding='utf-8') as f:
                news_cache['all_news'] = json.load(f)
        
        top_news_path = output_dir / 'top_news.json'
        if top_news_path.exists():
            with open(top_news_path, 'r', encoding='utf-8') as f:
                news_cache['top_news'] = json.load(f)
        
        category_news_path = output_dir / 'news_by_category.json'
        if category_news_path.exists():
            with open(category_news_path, 'r', encoding='utf-8') as f:
                news_cache['news_by_category'] = json.load(f)
        
        if all_news_path.exists():
            news_cache['last_update'] = datetime.fromtimestamp(
                all_news_path.stat().st_mtime
            ).isoformat()
        
        return True
    except Exception as e:
        logger.error(f"Ошибка загрузки кэша: {e}")
        return None


async def update_news_background():
    try:
        news_cache['is_updating'] = True
        logger.info("Начало обновления новостей...")
        
        # Загрузка конфигурации
        config = load_config()
        
        # Создание парсера и суммаризатора
        parser = RSSParser(max_news_per_source=config['news']['max_news_per_source'])
        summarizer = NewsSummarizer(config['api'])
        
        # Парсинг RSS
        news_by_category = parser.parse_all_sources(config['rss_sources'])
        all_news = parser.get_all_news_flat(news_by_category)
        
        # Суммаризация
        summarized_news = await summarizer.summarize_all_news(all_news)
        
        # Выбор топ-новостей
        top_news = await summarizer.select_top_news(
            summarized_news,
            top_count=config['news']['top_news_count']
        )
        
        news_cache['all_news'] = summarized_news
        news_cache['top_news'] = top_news
        
        categorized = {}
        for category in config['rss_sources'].keys():
            categorized[category] = [
                n for n in summarized_news if n.get('category') == category
            ]
        news_cache['news_by_category'] = categorized
        news_cache['last_update'] = datetime.now().isoformat()
        
        output_dir = Path('output')
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / 'all_news.json', 'w', encoding='utf-8') as f:
            json.dump(summarized_news, f, ensure_ascii=False, indent=2)
        
        with open(output_dir / 'top_news.json', 'w', encoding='utf-8') as f:
            json.dump(top_news, f, ensure_ascii=False, indent=2)
        
        with open(output_dir / 'news_by_category.json', 'w', encoding='utf-8') as f:
            json.dump(categorized, f, ensure_ascii=False, indent=2)
        
        logger.info("Новости успешно обновлены")
        
    except Exception as e:
        logger.error(f"Ошибка обновления новостей: {e}")
    finally:
        news_cache['is_updating'] = False


# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Загрузка кэша при старте сервера"""
    logger.info("Запуск API сервера...")
    load_cached_news()


@app.get("/", tags=["Root"])
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "News Aggregator API",
        "version": "1.0.0",
        "endpoints": {
            "/news/all": "Все новости",
            "/news/top": "Топ-новости дня",
            "/news/category/{category}": "Новости по категории",
            "/categories": "Список категорий",
            "/stats": "Статистика",
            "/update": "Обновить новости",
            "/docs": "Документация API"
        }
    }


@app.get("/news/all", response_model=NewsResponse, tags=["News"])
async def get_all_news(limit: Optional[int] = None, offset: int = 0):
    """
    Получить все новости
    
    - **limit**: Максимальное количество новостей (необязательно)
    - **offset**: Смещение для пагинации (по умолчанию 0)
    """
    if not news_cache['all_news']:
        load_cached_news()
    
    news = news_cache['all_news']
    
    if limit:
        news = news[offset:offset + limit]
    else:
        news = news[offset:]
    
    total_count = len(news_cache['all_news']) if news_cache['all_news'] and not asyncio.iscoroutine(news_cache['all_news']) else 0
    
    return NewsResponse(
        news=news,
        total=total_count,
        last_update=news_cache['last_update']
    )


@app.get("/news/top", response_model=NewsResponse, tags=["News"])
async def get_top_news():
    if not news_cache['top_news']:
        load_cached_news()
    
    return NewsResponse(
        news=news_cache['top_news'],
        total=len(news_cache['top_news']),
        last_update=news_cache['last_update']
    )


@app.get("/news/category/{category}", response_model=NewsResponse, tags=["News"])
async def get_news_by_category(category: str, limit: Optional[int] = None):
    """
    Получить новости по категории
    
    - **category**: Название категории (технологии, бизнес, наука, общее, развлечения, спорт)
    - **limit**: Максимальное количество новостей (необязательно)
    """
    if not news_cache['news_by_category']:
        load_cached_news()
    
    if category not in news_cache['news_by_category']:
        raise HTTPException(status_code=404, detail=f"Категория '{category}' не найдена")
    
    news = news_cache['news_by_category'][category]
    
    if limit:
        news = news[:limit]
    
    return NewsResponse(
        news=news,
        total=len(news_cache['news_by_category'][category]),
        last_update=news_cache['last_update']
    )


@app.get("/categories", tags=["Categories"])
async def get_categories():
    """Получить список всех категорий с количеством новостей"""
    if not news_cache['news_by_category']:
        load_cached_news()
    
    categories = []
    for category, news in news_cache['news_by_category'].items():
        categories.append({
            "category": category,
            "count": len(news),
            "news_count": len(news)
        })
    
    return {
        "categories": categories,
        "total_categories": len(categories)
    }


@app.get("/stats", response_model=StatsResponse, tags=["Statistics"])
async def get_stats():
    if not news_cache['all_news']:
        load_cached_news()
    
    config = load_config()
    
    # Подсчет источников
    sources_count = sum(
        len(sources) for sources in config['rss_sources'].values()
    )
    
    # Статистика по категориям
    categories_stats = {
        category: len(news)
        for category, news in news_cache['news_by_category'].items()
    }
    
    total_news_count = len(news_cache['all_news']) if news_cache['all_news'] and not asyncio.iscoroutine(news_cache['all_news']) else 0
    
    return StatsResponse(
        total_news=total_news_count,
        categories_count=len(news_cache['news_by_category']),
        sources_count=sources_count,
        last_update=news_cache['last_update'],
        categories=categories_stats
    )


@app.post("/update", tags=["Update"])
async def update_news(background_tasks: BackgroundTasks):
    """Запустить обновление новостей в фоновом режиме"""
    if news_cache['is_updating']:
        return {
            "status": "already_updating",
            "message": "Обновление уже выполняется"
        }
    
    background_tasks.add_task(update_news_background)
    
    return {
        "status": "started",
        "message": "Обновление новостей запущено в фоновом режиме"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    cached_news_count = 0
    if news_cache['all_news'] and not asyncio.iscoroutine(news_cache['all_news']):
        cached_news_count = len(news_cache['all_news'])
    
    return {
        "status": "healthy",
        "is_updating": news_cache['is_updating'],
        "last_update": news_cache['last_update'],
        "cached_news": cached_news_count
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
