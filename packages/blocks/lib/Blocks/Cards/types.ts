export interface CardButtonType {
  type: 'button';
  value: Prismeai.LocalizedText;
  url?: Prismeai.LocalizedText;
  popup?: boolean;
  event?: string;
  payload?: any;
  icon?: string;
}

export interface CardAction {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  content?: {
    type: 'event' | 'url';
    text: Prismeai.LocalizedText;
    value: string;
  }[];
}

export interface CardSquare {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
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
}

export interface CardArticle {
  title?: Prismeai.LocalizedText;
  subtitle?: Prismeai.LocalizedText;
  tag?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
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
      }
  )[];
}

export type CardsType =
  | CardArticle[]
  | CardAction[]
  | CardClassic[]
  | CardSquare[]
  | CardShort[];

export interface CardsConfig {
  title: Prismeai.LocalizedText;
  cards: CardsType;
  variant: 'classic' | 'short' | 'article' | 'square' | 'actions';
  layout: {
    type: 'grid' | 'column' | 'carousel';
    autoScroll?: boolean;
  };
}
