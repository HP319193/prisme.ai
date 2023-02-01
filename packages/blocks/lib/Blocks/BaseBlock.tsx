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
    config: { className, css = defaultStyles },
  } = useBlock();

  useEffect(() => {
    setContainerClassName(generateId());
  }, []);

  return (
    <>
      <style>{prefixCSS(css || '', `.${containerClassName}`)}</style>
      {cloneElement(children, {
        className: [className, containerClassName].join(' '),
      })}
    </>
  );
};
