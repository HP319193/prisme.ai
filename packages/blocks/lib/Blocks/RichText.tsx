import Markdown from 'markdown-to-jsx';
import { useMemo } from 'react';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';

interface Config {
  content: string;
}

export const RichText = () => {
  const { config: { content } = {} } = useBlock<Config>();
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

  return <Markdown options={options}>{localize(content)}</Markdown>;
};

export default RichText;
