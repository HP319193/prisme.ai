import Markdown from 'markdown-to-jsx';
import { useMemo } from 'react';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';

interface Config {
  content?: string;
}

interface RichTextProps extends Config {}

export const RichText = ({ content: initialContent }: RichTextProps) => {
  const { config: { content = initialContent } = {} } = useBlock<Config>();
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

  if (!content) return null;

  return (
    <Markdown className="block-rich-text" options={options}>
      {localize(content)}
    </Markdown>
  );
};

export default RichText;
