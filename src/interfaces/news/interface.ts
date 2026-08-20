export interface NewsSection { subtitle: string; paragraphs: string[] }

export interface NewsPost {
  id: number;
  title: string;
  summary: string;
  /** Max 2 — rendered as chips on the cards and the article modal. */
  categories: string[];
  /** Exactly one image per publication. */
  image: string;
  /** Drives the INDUSTRY filter on /news — not shown on the card. */
  industry: string;
  /** ISO date — internal ordering only. */
  date: string;
  /** Estimated reading time in minutes. */
  readingTime: number;
  /** Article body: one or more subtitled text blocks. */
  sections: NewsSection[];
}

export interface Trending { topic: string; count: number; delta: string; up: boolean }
