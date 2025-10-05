"""
Простые тесты для проверки работоспособности модулей
"""
import sys
from pathlib import Path

# Добавляем текущую директорию в путь для импорта
sys.path.insert(0, str(Path(__file__).parent))


def test_rss_parser():
    """Тест парсера RSS"""
    print("🧪 Тестирование RSSParser...")
    
    from rss_parser import RSSParser
    
    parser = RSSParser(max_news_per_source=3)
    
    # Тестируем парсинг одного источника
    news = parser.parse_feed(
        "https://habr.com/ru/rss/hub/artificial_intelligence/all/",
        "Habr AI"
    )
    
    if news:
        print(f"✅ Успешно получено {len(news)} новостей")
        print(f"   Первая новость: {news[0]['title'][:50]}...")
        return True
    else:
        print("❌ Не удалось получить новости")
        return False


def test_config_loading():
    """Тест загрузки конфигурации"""
    print("\n🧪 Тестирование загрузки конфигурации...")
    
    import yaml
    from pathlib import Path
    
    config_path = Path('config.yaml')
    
    if not config_path.exists():
        print("❌ Файл config.yaml не найден")
        return False
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    # Проверяем наличие обязательных секций
    required_sections = ['api', 'news', 'rss_sources']
    for section in required_sections:
        if section not in config:
            print(f"❌ Отсутствует секция '{section}' в config.yaml")
            return False
    
    print("✅ Конфигурация загружена успешно")
    print(f"   Провайдер API: {config['api']['provider']}")
    print(f"   Категорий новостей: {len(config['rss_sources'])}")
    return True


def test_env_file():
    """Тест наличия .env файла"""
    print("\n🧪 Тестирование переменных окружения...")
    
    from pathlib import Path
    from dotenv import load_dotenv
    import os
    
    env_path = Path('.env')
    
    if not env_path.exists():
        print("⚠️  Файл .env не найден (создайте на основе .env.example)")
        return False
    
    load_dotenv()
    
    # Проверяем наличие OpenRouter API ключа
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    
    if not openrouter_key:
        print("⚠️  OpenRouter API ключ не настроен в .env")
        return False
    
    if openrouter_key and openrouter_key != 'your_openrouter_api_key_here':
        print("✅ OpenRouter API ключ настроен")
    
    return True


def test_imports():
    """Тест импорта всех модулей"""
    print("\n🧪 Тестирование импорта модулей...")
    
    try:
        import rss_parser
        print("✅ rss_parser импортирован")
    except Exception as e:
        print(f"❌ Ошибка импорта rss_parser: {e}")
        return False
    
    try:
        import summarizer
        print("✅ summarizer импортирован")
    except Exception as e:
        print(f"❌ Ошибка импорта summarizer: {e}")
        return False
    
    try:
        import main
        print("✅ main импортирован")
    except Exception as e:
        print(f"❌ Ошибка импорта main: {e}")
        return False
    
    return True


def test_dependencies():
    """Тест наличия всех зависимостей"""
    print("\n🧪 Тестирование зависимостей...")
    
    dependencies = [
        'feedparser',
        'requests',
        'yaml',
        'dotenv',
        'openai'
    ]
    
    all_installed = True
    
    for dep in dependencies:
        try:
            if dep == 'yaml':
                __import__('yaml')
            elif dep == 'dotenv':
                __import__('dotenv')
            else:
                __import__(dep)
            print(f"✅ {dep} установлен")
        except ImportError:
            print(f"❌ {dep} не установлен")
            all_installed = False
    
    if not all_installed:
        print("\n💡 Установите зависимости: pip install -r requirements.txt")
    
    return all_installed


def run_all_tests():
    """Запуск всех тестов"""
    print("=" * 70)
    print("ЗАПУСК ТЕСТОВ НОВОСТНОГО АГРЕГАТОРА")
    print("=" * 70)
    
    tests = [
        ("Зависимости", test_dependencies),
        ("Импорты модулей", test_imports),
        ("Конфигурация", test_config_loading),
        ("Переменные окружения", test_env_file),
        ("RSS парсер", test_rss_parser),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Ошибка в тесте '{test_name}': {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 70)
    print("РЕЗУЛЬТАТЫ ТЕСТОВ")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\nИтого: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("\n🎉 Все тесты пройдены успешно!")
        print("Вы можете запустить агрегатор: python main.py")
    else:
        print("\n⚠️  Некоторые тесты не пройдены.")
        print("Пожалуйста, исправьте ошибки перед запуском.")


if __name__ == '__main__':
    run_all_tests()
