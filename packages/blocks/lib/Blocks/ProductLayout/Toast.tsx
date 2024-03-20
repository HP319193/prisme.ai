import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useBlock } from '../../Provider';
import { BlockContent } from './types';

interface ToastProps {
  toastOn: string;
}

interface ToastMessage {
  type?: 'success' | 'error' | 'warning' | 'loading';
  content: string | BlockContent | ReactNode;
  duration?: number;
}

export const Toast = ({ toastOn }: ToastProps) => {
  const { events } = useBlock();
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (!events) return;
    const off = events.on(toastOn, ({ payload }) => {
      if (!payload.content) return;
      const { type, content, duration = 5 } = payload as ToastMessage;
      const message = { type, content };
      setMessages((prev) => [...prev, message]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((item) => item !== message));
      }, duration * 1000);
    });
    return () => off();
  }, [toastOn, events]);
  return (
    <div className="toaster">
      {messages.map(({ type, content }) => (
        <div className={`toast-message toast-message--${type}`}>{content}</div>
      ))}
    </div>
  );
};

export default Toast;
