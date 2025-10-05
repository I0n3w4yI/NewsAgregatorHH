import aiohttp
import asyncio
import feedparser
from datetime import datetime
import pandas as pd


async def fetch_feed(session, url):
    """
    Асинхронно получаем и парсим RSS
    """

    try:
        async with session.get(url) as response:
            content = await response.text()
            feed = feedparser.parse(content)
            return feed
    except Exception as e:
        print(f"Ошибка для {url}: {e}")
        return None


async def process_feeds_simple(feed_urls):
    """
    Обработка rss и создание массива со статьями
    """

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_feed(session, url) for url in feed_urls]
        results = await asyncio.gather(*tasks)

        all_articles = []
        for feed in results:
            if feed and not feed.get('bozo'):
                for entry in feed.entries:
                    all_articles.append({
                        'title': entry.title,
                        'link': entry.link,
                        'published': entry.get('published', ''),
                        'summary': entry.get('summary', ''),
                        'source': feed.feed.get('title', 'Unknown')
    
                    })

        return all_articles




async def main():
    articles = await process_feeds_simple(RSS_FEEDS)
    print(f"Получено {len(articles)} статей")

    for article in articles[:3]:
        print(f"{article['title']}\n{article['link']}")
    
    df = pd.DataFrame(articles)
    df['published'] = pd.to_datetime(df['published'].apply(
        lambda x: datetime.strptime(
            x.replace("GMT", "+0000"),
            "%a, %d %b %Y %H:%M:%S %z")
        ),
        utc=True
    )

    print(df[df['published'] >= pd.Timestamp('2025-10-02 00:00:00', tz='UTC')])


def read_rss():
    """
    Читаем rss ссылки с файла links.txt
    """


    with open('links.txt') as file:
        feeds = [line.strip() for line in file if line.strip()]
        return feeds


RSS_FEEDS = read_rss()


if  __name__ == '__main__':
    asyncio.run(main())
