import { isLocalizedObject, Tooltip } from '@prisme.ai/design-system';
import { TooltipProps } from 'antd';
import { ReactNode, useCallback, useRef } from 'react';
import { BlockContext, useBlock } from '../Provider';
import {
  BlocksDependenciesContext,
  useBlocks,
} from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface ActionConfig extends BaseBlockConfig {
  type: 'external' | 'internal' | 'inside' | 'event' | 'script';
  value: string;
  text: ReactNode | Prismeai.LocalizedText | Prismeai.Block['blocks'];
  payload?: any;
  popup?: boolean;
  confirm?: {
    label?: string;
    yesLabel?: string;
    noLabel?: string;
    placement?: TooltipProps['placement'];
  };
  disabled?: boolean;
}

export interface ActionProps extends ActionConfig {
  events: BlockContext['events'];
  Link: BlocksDependenciesContext['components']['Link'];
  onClick?: () => void;
}

export const ActionButton = ({
  type,
  value,
  text,
  className,
  Link,
  onClick,
  popup,
  disabled,
  sectionId = '',
}: ActionProps) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  const { localize } = useLocalizedText();
  const html = isLocalizedObject(text) ? localize(text as {}) : null;
  const blocks = typeof text === 'object' && Array.isArray(text) ? text : null;
  const children = html ? undefined : blocks ? (
    <BlockLoader name="BlocksList" config={{ blocks: text }} />
  ) : (
    text
  );

  switch (type) {
    case 'script':
    case 'event':
      return (
        <div
          className={`pr-block-action pr-block-action--${type} ${
            disabled ? 'pr-block-action-wrapper__disabled' : ''
          } ${className}`}
          id={sectionId}
        >
          <button
            type="button"
            className="pr-block-action__button"
            onClick={onClick}
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={children}
            disabled={disabled}
          />
        </div>
      );
    case 'external':
    case 'internal':
      return (
        <Link
          href={value}
          className={`pr-block-action pr-block-action--link ${
            disabled ? '.pr-block-action-wrapper__disabled' : ''
          } ${className}`}
          target={popup ? '_blank' : undefined}
        >
          <button
            type="button"
            onClick={onClick}
            className="pr-block-action__button"
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={children}
            disabled={disabled}
            id={sectionId}
          />
        </Link>
      );
    case 'inside':
      return (
        <a
          href={`#${value}`}
          className={`pr-block-action pr-block-action--link ${
            disabled ? '.pr-block-action-wrapper__disabled' : ''
          } ${className}`}
          id={sectionId}
        >
          <button
            type="button"
            onClick={onClick}
            className="pr-block-action__button"
            dangerouslySetInnerHTML={html ? { __html: html } : undefined}
            children={children}
            disabled={disabled}
          />
        </a>
      );
    default:
      return (
        <span
          className={`pr-block-action ${className}`}
          dangerouslySetInnerHTML={html ? { __html: html } : undefined}
          children={children}
          id={sectionId}
        />
      );
  }
};

export const ConfirmAction = ({
  confirm: { label, yesLabel, noLabel, placement } = {},
  events,
  onClick,
  ...props
}: ActionProps) => {
  const { localize } = useLocalizedText();
  const tooltipRef = useRef<{ close: () => void }>(null);

  return (
    <Tooltip
      ref={tooltipRef}
      overlayClassName={`pr-block-action__confirm ${props.className}`}
      placement={placement}
      title={
        <>
          <div className="pr-block-action__confirm-title">
            {localize(label)}
          </div>
          <div className="pr-block-action__confirm-buttons flex justify-end">
            <button
              type="button"
              className="pr-block-action__confirm-button pr-block-action__confirm-button--yes"
              onClick={() => {
                onClick && onClick();
                tooltipRef.current?.close();
              }}
            >
              {localize(yesLabel)}
            </button>
            <button
              className="pr-block-action__confirm-button pr-block-action__confirm-button--no"
              type="button"
              onClick={() => tooltipRef.current?.close()}
            >
              {localize(noLabel)}
            </button>
          </div>
        </>
      }
      trigger={['click']}
    >
      <ActionButton {...props} events={events} />
    </Tooltip>
  );
};

export const Action = (props: ActionProps) => {
  const onClick = useCallback(() => {
    if (props.onClick) {
      props.onClick();
    }
    if (!props.events || !props.value) return;
    switch (props.type) {
      case 'event':
        return props.events.emit(props.value, props.payload);
      case 'script':
        try {
          new Function(props.value)();
        } catch (e) {
          console.error(e);
        }
        return;
    }
  }, [props.type, props.events, props.value, props.payload, props.onClick]);

  if (props.confirm) {
    return <ConfirmAction {...props} onClick={onClick} />;
  }

  return <ActionButton {...props} onClick={onClick} />;
};

const defaultStyles = `:block {
  padding: 1rem;
}
:block .pr-block-action__button{
  padding: 0.5rem 1rem;
}
:block .pr-block-action-wrapper__disabled {
  pointer-events: none;
}
:block.pr-block-action--event .pr-block-action__button {
  background: var(--accent-color);
  color: var(--accent-contrast-color);
  border-radius: 0.5rem;
}
:root .pr-block-action__confirm-button {
  margin-left: 1rem;
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
