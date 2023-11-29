import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

interface HeadConfig {
  content?: string;
}

export const HeadBlock = () => {
  const {
    config: { content = '' },
  } = useBlock<HeadConfig>();
  const {
    components: { Head },
  } = useBlocks();
  if (!Head) return null;
  return <Head>{content}</Head>;
};

export default HeadBlock;
