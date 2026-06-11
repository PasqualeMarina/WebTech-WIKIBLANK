export type GameCategory = {
  id: string
  label: string
  wikipediaCategory: string
}

export const gameCategories: GameCategory[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    wikipediaCategory: 'Edible fruits',
  },
  {
    id: 'colors',
    label: 'Colors',
    wikipediaCategory: 'Web colors',
  },
  {
    id: 'domestic_animals',
    label: 'Domesticated Animals',
    wikipediaCategory: 'Domesticated animals',
  },
  {
    id: 'body_parts',
    label: 'Body Parts',
    wikipediaCategory: 'Human anatomy',
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    wikipediaCategory: 'Vehicles by type',
  },
  {
    id: 'sports',
    label: 'Sports',
    wikipediaCategory: 'Team sports',
  },
  {
    id: 'european_capitals',
    label: 'European Capitals',
    wikipediaCategory: 'Capital cities in Europe',
  },
  {
    id: 'natural_features',
    label: 'Nature Landscapes',
    wikipediaCategory: 'Landforms',
  },
  {
    id: 'materials',
    label: 'Materials',
    wikipediaCategory: 'Materials',
  },
  {
    id: 'football_clubs',
    label: 'Football Clubs',
    wikipediaCategory: 'UEFA Champions League winning clubs',
  },
  {
    id: 'top_100_footballers',
    label: 'Top 100 Footballers Ever',
    wikipediaCategory: 'FIFA 100',
  },
]
