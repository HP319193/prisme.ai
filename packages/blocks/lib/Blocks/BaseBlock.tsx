import { cloneElement, ReactElement, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!blocksStyles) return;
    const blockStyle = getBlockStyles({
      css,
      defaultStyles,
      containerClassName,
      parentClassName,
    });
    styles.add(blockStyle);
    blocksStyles.textContent = Array.from(styles).join('\n');

    return () => {
      styles.delete(blockStyle);
    };
  }, [css, defaultStyles, containerClassName, parentClassName]);

  return cloneElement(children, {
    className: [className, containerClassName].join(' '),
  });
};
