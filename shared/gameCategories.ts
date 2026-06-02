export type GameCategory = {
  id: string
  label: string
  wikipediaCategory: string
}

export const gameCategories: GameCategory[] = [
  {
    id: 'physics',
    label: 'Fisica',
    wikipediaCategory: 'Physics',
  },
  {
    id: 'history',
    label: 'Storia',
    wikipediaCategory: 'History',
  },
  {
    id: 'biology',
    label: 'Biologia',
    wikipediaCategory: 'Biology',
  },
  {
    id: 'cinema',
    label: 'Cinema',
    wikipediaCategory: 'Cinema',
  },
  {
    id: 'football',
    label: 'Calcio',
    wikipediaCategory: 'Association football',
  },
  {
    id: 'geography',
    label: 'Geografia',
    wikipediaCategory: 'Geography',
  },
]
