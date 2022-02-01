import { useEffect } from 'react';

export interface Shortcut {
  key: string;
  meta?: boolean;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  command: (e: KeyboardEvent) => void;
}

export const useKeyboardShortcut = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      shortcuts.forEach(
        ({
          key,
          meta = false,
          shift = false,
          ctrl = false,
          alt = false,
          command,
        }) => {
          if (
            e.key === key &&
            meta === e.metaKey &&
            shift === e.shiftKey &&
            ctrl === e.ctrlKey &&
            alt === e.altKey
          ) {
            command(e);
          }
        }
      );
    };
    window.document.addEventListener('keydown', listener);

    return () => {
      window.document.removeEventListener('keydown', listener);
    };
  });
};

export default useKeyboardShortcut;
