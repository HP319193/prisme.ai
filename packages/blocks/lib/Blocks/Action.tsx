import { isLocalizedObject } from '@prisme.ai/design-system';
import { ReactNode } from 'react';
import { BlockContext, useBlock } from '../Provider';
import {
  BlocksDependenciesContext,
  useBlocks,
} from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface ActionConfig extends BaseBlockConfig {
  type: 'external' | 'internal' | 'inside' | 'event';
  value: string;
  text: ReactNode | Prismeai.LocalizedText;
  payload?: any;
  popup?: boolean;
}

export interface ActionProps extends ActionConfig {
  events: BlockContext['events'];
  Link: BlocksDependenciesContext['components']['Link'];
  onClick?: () => void;
}

export const Action = ({
  type,
  value,
  text,
  payload,
  className,
  Link,
  events,
  onClick,
  popup,
}: ActionProps) => {
  const { localize } = useLocalizedText();
  const html = isLocalizedObject(text) ? localize(text as {}) : null;
  switch (type) {
    case 'event':
      return (
        <div className={`pr-block-action pr-block-action--event ${className}`}>
          <button
            type="button"
            className="pr-block-action__button"
            onClick={() => {
              onClick && onClick();
              if (!events || !value) return;
              events.emit(value, payload);
            }}
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={html ? undefined : text}
          />
        </div>
      );
    case 'external':
    case 'internal':
      return (
        <Link
          href={value}
          className={`pr-block-action pr-block-action--link ${className}`}
          target={popup ? '_blank' : undefined}
        >
          <button
            type="button"
            onClick={() => {
              onClick && onClick();
            }}
            className="pr-block-action__button"
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={html ? undefined : text}
          />
        </Link>
      );
    case 'inside':
      return (
        <a
          href={`#${value}`}
          className={`pr-block-action pr-block-action--link ${className}`}
        >
          <button
            type="button"
            onClick={() => {
              onClick && onClick();
            }}
            className="pr-block-action__button"
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={html ? undefined : text}
          />
        </a>
      );
    default:
      return (
        <span
          className={`pr-block-action ${className}`}
          dangerouslySetInnerHTML={html ? { __html: html } : undefined}
          children={html ? undefined : text}
        />
      );
  }
};
const defaultStyles = `:block {
  padding: 1rem;
}
:block .pr-block-action__button{
  padding: 0.5rem 1rem;
}
:block.pr-block-action--event .pr-block-action__button {
  background: var(--accent-color);
  color: var(--accent-contrast-color);
  border-radius: 0.5rem;
}`;
export const ActionInContext = () => {
  const { config, events } = useBlock<ActionConfig>();
  const {
    components: { Link },
  } = useBlocks();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Action {...config} Link={Link} events={events} />
    </BaseBlock>
  );
};
ActionInContext.styles = defaultStyles;
export default ActionInContext;
