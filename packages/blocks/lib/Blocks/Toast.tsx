import { useCallback, useEffect, useState } from 'react';
import { useBlock } from '../Provider';
import useLocalizedText from '../useLocalizedText';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

const DEFAULT_DURATION = 5;

interface ToastProps extends BaseBlockConfig {
  toastOn: string;
}

interface ToastMessage {
  type?: 'success' | 'error' | 'warning' | 'loading';
  content: string | Prismeai.LocalizedText;
  duration?: number;
  closed?: boolean;
  key: string;
}

let count = 0;

export const Toast = ({ className, toastOn }: ToastProps) => {
  const { events } = useBlock();
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const { localize } = useLocalizedText();

  const close = useCallback(
    (message: ToastMessage) => () => {
      const closedMessage = { ...message, closed: true };
      setMessages((prev) =>
        prev.map((item) => (item === message ? closedMessage : item))
      );
      setTimeout(
        () =>
          setMessages((prev) => prev.filter((item) => item !== closedMessage)),
        200
      );
    },
    []
  );

  useEffect(() => {
    if (!events) return;
    const off = events.on(toastOn, ({ payload }) => {
      if (!payload.content) return;
      const {
        type,
        content,
        duration = DEFAULT_DURATION,
      } = payload as ToastMessage;
      const message = { type, content, key: `${++count}` };
      setMessages((prev) => [...prev, message]);
      setTimeout(close(message), duration * 1000);
    });
    return () => off();
  }, [toastOn, events]);

  return (
    <div className={className}>
      {messages.map((message) => (
        <div
          key={message.key}
          className={`pr-toast-message pr-toast-message--${message.type} ${
            message.closed ? 'pr-toast-message--closed' : ''
          }`}
        >
          {localize(message.content)}
          <button
            className="pr-toast-message-close"
            type="button"
            onClick={close(message)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
};

const defaultStyles = `:block {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 99999999;
}
.pr-toast-message {
  position: relative;
  background: white;
  border-radius: 1rem;
  padding: 1rem 2rem;
  margin: .5rem 0;
  border: 1px solid;
  opacity: 1;
  transition: opacity .2s ease-in, transform .2s ease-in;
}
.pr-toast-message--closed {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}
.pr-toast-message--success {
  background: green;
  color: white;
}
.pr-toast-message--error {
  background: red;
  color: white;
}
.pr-toast-message--warning {
  background: orange;
  color: white;
}
.pr-toast-message-close {
  position: absolute;
  top: 0;
  right: .5rem;
  font-weight: bold;
}
`;

export const ToastInContext = () => {
  const { config } = useBlock<ToastProps>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Toast {...config} />
    </BaseBlock>
  );
};
ToastInContext.styles = defaultStyles;

export default ToastInContext;
