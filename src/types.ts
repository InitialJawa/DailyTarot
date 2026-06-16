import { TarotCard } from './data/tarot';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Reading {
  id: string;
  date: string;
  type: string;
  cards: TarotCard[];
  question?: string;
  interpretation?: string;
  chatHistory?: ChatMessage[];
}

export type ThemeOption = 'light' | 'dark-mystic' | 'minimalis' | 'alam';

export interface UserProfile {
  name: string;
  theme: ThemeOption;
  soundEnabled: boolean;
  history: Reading[];
  birthDate?: string;
  currentActivity?: string;
  relationshipStatus?: string;
}

export type SpreadType = 'Kartu Harian' | 'Tiga Kartu (Lalu, Kini, Nanti)';
