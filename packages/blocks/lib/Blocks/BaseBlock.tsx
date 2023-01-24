import { cloneElement, ReactElement, useRef } from 'react';
import { useBlock } from '../Provider';
import prefixCSS from '../utils/prefixCSS';

interface BaseBlock {
  children: ReactElement;
}

export const BaseBlock = ({ children }: BaseBlock) => {
  const {
    config: { className, css },
  } = useBlock();

  const containerClassName = useRef(
    `block-${parseInt(`${Math.random() * 1000}`)}`
  );
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
