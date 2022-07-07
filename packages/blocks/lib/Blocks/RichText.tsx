import Markdown from 'markdown-to-jsx';
import { HTMLAttributes, useMemo } from 'react';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';

export const RichTextRenderer = ({
  children,
  ...props
}: { children: string } & HTMLAttributes<HTMLDivElement>) => {
  const { localize } = useLocalizedText();
  const {
    components: { Link },
  } = useBlocks();
  const options = useMemo(
    () => ({
      overrides: {
        a: Link,
      },
    }),
    []
  );

  if (!children) return null;

  return (
    <Markdown {...props} options={options}>
      {`<div>${localize(children)}</div>`}
    </Markdown>
  );
};

export const RichText = () => {
  const { config: { content } = {} } = useBlock();
  return (
    <RichTextRenderer className="block-rich-text">{content}</RichTextRenderer>
  );
};

export default RichText;
