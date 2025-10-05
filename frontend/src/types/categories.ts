export interface CategoryStructure {
  name: string;
  subcategories?: string[];
}

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

