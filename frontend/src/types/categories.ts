export interface CategoryStructure {
  name: string;
  subcategories?: string[];
}

// Интерфейс для категорий из API
export interface ApiCategory {
  category: string;
  count: number;
  news_count: number;
}

// Старые статические категории (для fallback)
export const categoriesData: CategoryStructure[] = [
  {
    name: 'Спорт',
    subcategories: [
      'Футбол',
      'Теннис',
      'Хоккей',
      'F1',
      'Баскетбол',
      'Бокс/ММА',
      'Биатлон',
      'Лыжи',
      'Фигурное катание',
      'Волейбол'
    ]
  },
  {
    name: 'Киберспорт',
    subcategories: ['Dota2', 'CS2']
  },
  {
    name: 'Технологии',
    subcategories: ['Backend', 'FrontEnd', 'Администрирование', 'Научпоп']
  },
  {
    name: 'Наука',
    subcategories: []
  },
  {
    name: 'Путешествия',
    subcategories: []
  },
  {
    name: 'Финансы',
    subcategories: []
  },
  {
    name: 'Авто',
    subcategories: []
  }
];

// Функция для преобразования API категорий в структуру для UI
export function transformApiCategories(apiCategories: ApiCategory[]): CategoryStructure[] {
  return apiCategories.map(apiCategory => ({
    name: capitalizeFirstLetter(apiCategory.category),
    subcategories: [] // API не предоставляет подкатегории, поэтому оставляем пустым
  }));
}

// Функция для капитализации первой буквы
function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

