export interface CardButtonType {
  type: 'button';
  value: Prismeai.LocalizedText;
  url?: Prismeai.LocalizedText;
  popup?: boolean;
  event?: string;
  payload?: any;
  icon?: string;
}

export interface Card {
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

export interface CardsConfig {
  title: Prismeai.LocalizedText;
  cards: Card[];
  type: 'classic' | 'square' | 'withButtons';
  layout: {
    type: 'grid' | 'column' | 'carousel';
    autoScroll?: boolean;
  };
}
