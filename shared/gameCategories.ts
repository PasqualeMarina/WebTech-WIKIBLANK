export type GameCategory = {
  id: string
  label: string
  wikipediaCategory: string
}

export const gameCategories: GameCategory[] = [
  {
    id: 'physics',
    label: 'Physics',
    wikipediaCategory: 'Physics',
  },
  {
    id: 'history',
    label: 'History',
    wikipediaCategory: 'History',
  },
  {
    id: 'biology',
    label: 'Biology',
    wikipediaCategory: 'Biology',
  },
  {
    id: 'cinema',
    label: 'Cinema',
    wikipediaCategory: 'Film',
  },
  {
    id: 'football',
    label: 'Football',
    wikipediaCategory: 'Association football',
  },
  {
    id: 'geography',
    label: 'Geography',
    wikipediaCategory: 'Geography',
  },
]
