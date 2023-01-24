import { RefObject } from 'react';
import { Action } from '../ActionOrLink';
import { BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

export interface CardButtonType {
  type: 'button';
  value: Prismeai.LocalizedText;
  url?: Prismeai.LocalizedText;
  popup?: boolean;
  event?: string;
  payload?: any;
  icon?: string;
  className?: string;
}

export interface CardAction {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  content?: {
    type: 'event' | 'url';
    text: Prismeai.LocalizedText;
    value: string;
    payload?: any;
    popup?: boolean;
  }[];
  backgroundColor?:
    | 'black'
    | 'white'
    | 'transparent-white'
    | 'transparent-black';
}

export interface CardSquare {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  action?: Action;
}

export interface CardShort {
  title?: Prismeai.LocalizedText;
  subtitle?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  backgroundColor?:
    | 'black'
    | 'white'
    | 'transparent-white'
    | 'transparent-black';
  action?: Action;
}

export interface CardArticle {
  title?: Prismeai.LocalizedText;
  subtitle?: Prismeai.LocalizedText;
  tag?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  action?: Action;
}

export interface CardClassic {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  content?: (
    | {
        type: 'text';
        value: Prismeai.LocalizedText;
      }
    | CardButtonType
    | {
        type: 'accordion';
        title: Prismeai.LocalizedText;
        content: Prismeai.LocalizedText;
        icon?: string;
        collapsed?: boolean;
      }
  )[];
}

export interface CardBlocks {
  content: BlocksListConfig;
}

export const cardVariants = [
  'classic',
  'short',
  'article',
  'square',
  'actions',
  'blocks',
] as const;

export type CardVariant = typeof cardVariants[number];

export type Cards =
  | CardClassic[]
  | CardShort[]
  | CardArticle[]
  | CardSquare[]
  | CardAction[]
  | CardBlocks[];

export interface CardsConfig extends BaseBlockConfig {
  title: Prismeai.LocalizedText;
  cards: Cards;
  variant: CardVariant;
  layout: {
    type: 'grid' | 'column' | 'carousel';
    autoScroll?: boolean;
  };
}

export interface CardProps<T = Cards> extends Omit<CardsConfig, 'cards'> {
  styles: {
    container: string;
  };
  container: RefObject<HTMLDivElement>;
  canScroll: boolean | null;
  scroll: (step: number) => () => void;
  cards: T;
  getCoverStyle: (index: number) => any;
}
