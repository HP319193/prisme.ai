import { Tooltip } from '@prisme.ai/design-system';
import { PlusOutlined } from '@ant-design/icons';
import { usePageBuilder } from './context';
import { useTranslation } from 'next-i18next';

interface AddWidgetProps {
  after: number;
}
export const AddWidget = ({ after }: AddWidgetProps) => {
  const { t } = useTranslation('workspaces');
  const { addWidget } = usePageBuilder();
  return (
    <div className="flex justify-center">
      <Tooltip title={t('pages.widgets.add')}>
        <button
          className="bg-graph-accent text-white rounded w-10 h-10"
          onClick={() => addWidget(after + 1)}
        >
          <PlusOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default AddWidget;
