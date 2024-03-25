import { ReactElement } from 'react';
import { BlocksListConfig } from '../BlocksList';

export type BlockContent = string | ReactElement | BlocksListConfig['blocks'];
