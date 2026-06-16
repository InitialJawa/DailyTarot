import { TarotCard } from './data/tarot';

export interface Reading {
  id: string;
  date: string;
  type: string;
  cards: TarotCard[];
  question?: string;
  interpretation?: string;
}

export type ThemeOption = 'light' | 'dark-mystic' | 'minimalis' | 'alam';

export interface UserProfile {
  name: string;
  theme: ThemeOption;
  soundEnabled: boolean;
  history: Reading[];
}

export type SpreadType = 'Kartu Harian' | 'Tiga Kartu (Lalu, Kini, Nanti)';
