import { Tooltip } from '@prisme.ai/design-system';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';

interface EditBlockProps {
  onEdit: () => void;
}
const EditBlock = ({ onEdit }: EditBlockProps) => {
  const { t } = useTranslation('workspaces');
  return (
    <div className="flex justify-center absolute right-[-10px] top-[-10px] z-10">
      <Tooltip title={t('pages.blocks.edit')}>
        <button
          className="bg-graph-accent text-white rounded-[0.3rem] w-5 h-5 text-sm"
          onClick={onEdit}
        >
          <EditOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default EditBlock;
