export interface Word {
  ja: string;
  reading: string;
  en: string;
}

export interface Sentence {
  id: number;
  ja_sentence: string;
  en_sentence: string;
  words: Word[];
}

export type ViewMode = 'over-under' | 'side-by-side';
