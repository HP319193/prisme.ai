import { cloneElement, ReactElement, useEffect, useRef, useState } from 'react';
import { useBlock } from '../Provider';
import generateId from '../utils/generateId';
import getBlockStyles from '../utils/getBlockStyles';

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
  const {
    config: { className, parentClassName = '', css = defaultStyles, cssId },
  } = useBlock();
  const [containerClassName] = useState(`__block-${cssId || generateId()}`);
  const blockStyle = useRef('');

  useEffect(() => {
    if (!blocksStyles) return;
    blockStyle.current = getBlockStyles({
      css,
      defaultStyles,
      containerClassName,
      parentClassName,
    });
    styles.add(blockStyle.current);
    blocksStyles.textContent = Array.from(styles).join('\n');
  }, [css, defaultStyles, containerClassName, parentClassName]);

  useEffect(() => {
    () => {
      if (!blockStyle.current) return;
      styles.delete(blockStyle.current);
    };
  }, []);

  return cloneElement(children, {
    className: [className, containerClassName].join(' '),
  });
};
