import { cloneElement, ReactElement, useRef } from 'react';
import { useBlock } from '../Provider';
import prefixCSS from '../utils/prefixCSS';

interface BaseBlock {
  children: ReactElement;
}

const ids = new Set();
function generateId() {
  let newId;
  while (!newId || ids.has(newId)) {
    newId = `block-${parseInt(`${Math.random() * 1000}`)}`;
  }

  return newId;
}

export const BaseBlock = ({ children }: BaseBlock) => {
  const {
    config: { className, css },
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
