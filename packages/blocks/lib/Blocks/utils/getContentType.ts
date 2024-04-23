import { ReactElement, ReactNode } from 'react';
import { BlocksListConfig } from '../BlocksList';
import { BlockContent } from './types';

export function getContentType(content: BlockContent) {
  if (typeof content !== 'object') {
    return 'string';
  }
  if (
    Array.isArray(content) &&
    typeof content[0] === 'object' &&
    content[0].slug
  ) {
    return 'blocks';
  }
  return 'component';
}

export function isString(content: any): content is string {
  return typeof content !== 'object';
}

export function isBlock(content: any): content is BlocksListConfig['blocks'] {
  return (
    typeof content === 'object' &&
    Array.isArray(content) &&
    typeof content[0] === 'object' &&
    !!content[0].slug
  );
}

export function isRenderProp(content: any): content is ReactElement {
  return typeof content === 'object' && !!(content as any).$$typeof;
}
