import { ReactNode } from 'react';
import { BlockContext, useBlock } from '../Provider';
import {
  BlocksDependenciesContext,
  useBlocks,
} from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface ActionConfig extends BaseBlockConfig {
  type: 'external' | 'internal' | 'inside' | 'event';
  value: string;
  text: ReactNode;
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
  switch (type) {
    case 'event':
      return (
        <div
          className={`pr-block-action pr-block-action--event ${className}            block-header__nav-item-button`}
        >
          <button
            type="button"
            className="pr-block-action__button"
            onClick={() => {
              onClick && onClick();
              if (!events || !value) return;
              events.emit(value, payload);
            }}
            dangerouslySetInnerHTML={
              typeof text === 'string' ? { __html: text } : undefined
            }
            children={typeof text === 'string' ? undefined : text}
          />
        </div>
      );
    case 'external':
    case 'internal':
      return (
        <Link
          href={value}
          className={`pr-block-action pr-block-action--link ${className}            block-header__nav-item-link`}
          target={popup ? '_blank' : undefined}
        >
          <button
            type="button"
            onClick={() => {
              onClick && onClick();
            }}
            className="pr-block-action__button            block-header__nav-item-button"
            dangerouslySetInnerHTML={
              typeof text === 'string' ? { __html: text } : undefined
            }
            children={typeof text === 'string' ? undefined : text}
          />
        </Link>
      );
    case 'inside':
      return (
        <a
          href={`#${value}`}
          className={`pr-block-action pr-block-action--link ${className}            block-header__nav-item-link`}
        >
          <button
            type="button"
            onClick={() => {
              onClick && onClick();
            }}
            className="pr-block-action__button           block-header__nav-item-button"
            dangerouslySetInnerHTML={
              typeof text === 'string' ? { __html: text } : undefined
            }
            children={typeof text === 'string' ? undefined : text}
          />
        </a>
      );
    default:
      return <span className={`pr-block-action ${className}`}>{text}</span>;
  }
};
const defaultStyles = `:block {

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
