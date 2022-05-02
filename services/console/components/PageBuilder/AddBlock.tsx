import { Tooltip } from '@prisme.ai/design-system';
import { PlusOutlined } from '@ant-design/icons';
import { usePageBuilder } from './context';
import { useTranslation } from 'next-i18next';

interface AddBlockProps {
  after: number;
  centered?: boolean;
}
const AddBlock = ({ after, centered = false }: AddBlockProps) => {
  const { t } = useTranslation('workspaces');
  const { addBlock } = usePageBuilder();
  return (
    <div
      className={`flex justify-center absolute ${
        centered ? 'right-0 left-0' : 'right-[-10px] top-[-10px]'
      } z-10`}
    >
      <Tooltip title={t('pages.blocks.add')}>
        <button
          className={`bg-graph-accent text-white ${
            centered ? 'rounded p-3' : 'rounded-[0.3rem] w-5 h-5'
          } text-sm`}
          onClick={() => addBlock(after + 1)}
        >
          <PlusOutlined className={centered ? 'mr-2' : ''} />
          {centered && t('pages.blocks.add')}
        </button>
      </Tooltip>
    </div>
  );
};

export default AddBlock;
