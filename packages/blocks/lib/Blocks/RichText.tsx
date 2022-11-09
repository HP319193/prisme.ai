import Markdown from 'markdown-to-jsx';
import { HTMLAttributes, useMemo } from 'react';
import { BlockComponent } from '../BlockLoader';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';

interface RichTextConfig {
  content: string;
}

export const RichTextRenderer = ({
  children,
  ...props
}: {
  children: string | Prismeai.LocalizedText;
} & HTMLAttributes<HTMLDivElement>) => {
  const { localize } = useLocalizedText();
  const {
    components: { Link },
  } = useBlocks();
  const A = useMemo<typeof Link>(
    () => ({ href, ...props }) => (
      <Link href={href}>
        <a {...props} />
      </Link>
    ),
    [Link]
  );
  const options = useMemo(
    () => ({
      overrides: {
        a: A,
      },
      forceBlock: true,
    }),
    []
  );

  if (!children) return null;

  return (
    <Markdown {...props} options={options}>
      {localize(children)}
    </Markdown>
  );
};

export const RichText: BlockComponent = () => {
  const { config } = useBlock<RichTextConfig>();
  const { content = '' } = config || {};
  return (
    <RichTextRenderer className="block-rich-text">{content}</RichTextRenderer>
  );
};

export default RichText;
