import {
  cloneElement,
  DetailedReactHTMLElement,
  ReactNode,
  useMemo,
} from 'react';
import { tokenize } from './tokenize';

interface HighlightProps {
  children: string;
  highlight?: string;
  component?: ReactNode;
}

export const Highlight = ({
  children,
  highlight = '',
  component = <span className="font-bold"></span>,
}: HighlightProps) => {
  const parts = useMemo(() => tokenize(children, highlight), [
    children,
    highlight,
  ]);

  return (
    <>
      {parts.map(({ highlight, text, start, end }) =>
        highlight && component ? (
          cloneElement(
            component as DetailedReactHTMLElement<any, HTMLElement>,
            {
              key: `${start}-${end}`,
              children: text,
            }
          )
        ) : (
          <span key={`${start}-${end}`}>{text}</span>
        )
      )}
    </>
  );
};

export default Highlight;
