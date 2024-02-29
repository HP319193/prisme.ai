import { ReactElement } from 'react';
import { ActionConfig } from '../Action';
import { BlocksListConfig } from '../BlocksList';

export type BlockContent = string | ReactElement | BlocksListConfig['blocks'];

export type Icons = string | 'gear' | 'share' | 'home' | 'charts';

export interface SidebarHeaderProps {
  logo?: BlockContent;
  title?: BlockContent;
  tooltip?: string;
  href?: string;
  back?: string;
  buttons?:
    | ReactElement
    | BlocksListConfig['blocks']
    | ({
        icon?: Icons;
        tooltip?: string;
      } & ActionConfig)[];
}

export interface ContentProps {
  title: BlockContent;
  description: BlockContent;
  tabs: ({
    title: BlockContent;
    content: BlockContent;
    selected?: boolean;
    columns?: number;
  } & ActionConfig)[];
  additionalButtons?: ActionConfig[];
  content?: BlockContent;
}

export interface ProductLayoutProps {
  sidebar?: {
    header?: ReactElement | SidebarHeaderProps;
    items?:
      | BlockContent
      | ({
          icon?: Icons;
          selected?: boolean;
        } & ActionConfig)[];
    opened?: boolean;
  };
  content?: ReactElement | ContentProps;
}
