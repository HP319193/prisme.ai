import { cloneElement, ReactElement, useRef } from 'react';
import { useBlock } from '../Provider';
import generateId from '../utils/generateId';
import prefixCSS from '../utils/prefixCSS';

interface BaseBlock {
  children: ReactElement;
  defaultStyles?: string;
}

export const BaseBlock = ({ children, defaultStyles }: BaseBlock) => {
  const {
    config: { className, css = defaultStyles },
  } = useBlock();
  const containerClassName = useRef(generateId());
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: prefixCSS(css || '', `.${containerClassName.current}`),
        }}
      />
      {cloneElement(children, {
        className: [className, containerClassName.current].join(' '),
      })}
    </>
  );
};