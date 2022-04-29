import { Tooltip } from '@prisme.ai/design-system';
import { PlusOutlined } from '@ant-design/icons';
import { usePageBuilder } from './context';
import { useTranslation } from 'next-i18next';

interface AddBlockProps {
  after: number;
}
export const AddBlock = ({ after }: AddBlockProps) => {
  const { t } = useTranslation('workspaces');
  const { addBlock } = usePageBuilder();
  return (
    <div className="flex justify-center">
      <Tooltip title={t('pages.blocks.add')}>
        <button
          className="bg-graph-accent text-white rounded w-10 h-10"
          onClick={() => addBlock(after + 1)}
        >
          <PlusOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default AddBlock;
