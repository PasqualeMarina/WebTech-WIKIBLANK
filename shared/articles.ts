export type ArticleCategory = {
  id: number
  name: string
}

export type ArticleWord =
  | {
      text: string
      revealed: true
    }
  | {
      length: number
      revealed: false
    }

export type ArticleParagraph = ArticleWord[]

export type Article = {
  id: number
  title: string | null
  category: ArticleCategory
  paragraphs: ArticleParagraph[]
}
