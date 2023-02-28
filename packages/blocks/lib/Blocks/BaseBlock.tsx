import { cloneElement, ReactElement, useEffect, useState } from 'react';
import { useBlock } from '../Provider';
import generateId from '../utils/generateId';
import prefixCSS from '../utils/prefixCSS';

interface BaseBlock {
  children: ReactElement;
  defaultStyles?: string;
}

export const BaseBlock = ({ children, defaultStyles }: BaseBlock) => {
  const [containerClassName, setContainerClassName] = useState('');
  const {
    config: { className, parentClassName = '', css = defaultStyles },
  } = useBlock();

  useEffect(() => {
    setContainerClassName(generateId());
  }, []);

  return (
    <>
      <style>
        {prefixCSS((css || '').replace(/@import\s+default;/, defaultStyles), {
          block: `.${containerClassName}`,
          parent: `.${parentClassName}`,
        })}
      </style>
      {cloneElement(children, {
        className: [className, containerClassName].join(' '),
      })}
    </>
  );
};
