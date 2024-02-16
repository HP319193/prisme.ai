import { isLocalizedObject } from '@prisme.ai/design-system';
import { ReactElement } from 'react';
import { useBlocks } from '../../Provider/blocksContext';
import useLocalizedText from '../../useLocalizedText';
import { isBlock, isString } from './getContentType';
import { BlockContent } from './types';

interface BlockProps {
  content: BlockContent;
  className?: string;
  ifString?: (props: { content: string; className?: string }) => ReactElement;
}
export const Block = ({
  content,
  className,
  ifString: Component = () => <>{content}</>,
}: BlockProps) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  const { localize } = useLocalizedText();
  if (isLocalizedObject(content)) {
    content = localize(content);
  }
  if (isString(content))
    return <Component content={content} className={className} />;
  if (isBlock(content))
    return (
      <BlockLoader name="BlocksList" config={{ blocks: content, className }} />
    );
  return <>{content}</>;
};
