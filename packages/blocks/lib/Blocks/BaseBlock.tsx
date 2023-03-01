import { cloneElement, ReactElement, useEffect, useState } from 'react';
import { useBlock } from '../Provider';
import generateId from '../utils/generateId';
import prefixCSS from '../utils/prefixCSS';

interface BaseBlock {
  children: ReactElement;
  defaultStyles?: string;
}

const styles = new Set();
let blocksStyles: HTMLStyleElement;
if (typeof window !== 'undefined') {
  blocksStyles = document.createElement('style');
  document.querySelector('head')?.appendChild(blocksStyles);
}

export const BaseBlock = ({ children, defaultStyles }: BaseBlock) => {
  const [containerClassName, setContainerClassName] = useState('');
  const {
    config: { className, parentClassName = '', css = defaultStyles },
  } = useBlock();

  useEffect(() => {
    setContainerClassName(generateId());
  }, []);

  useEffect(() => {
    if (!blocksStyles) return;
    const blockStyle = prefixCSS(
      (css || '').replace(/@import\s+default;/, defaultStyles),
      {
        block: `.${containerClassName}`,
        parent: `.${parentClassName}`,
      }
    );
    styles.add(blockStyle);
    blocksStyles.textContent = Array.from(styles).join('\n');

    return () => {
      styles.delete(blockStyle);
    };
  }, [css, containerClassName, parentClassName]);

  return cloneElement(children, {
    className: [className, containerClassName].join(' '),
  });
};
