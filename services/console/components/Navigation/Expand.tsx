import { DoubleLeftOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';

interface ExpandProps {
  expanded: boolean;
  onToggle: () => void;
}

export const Expand = ({ expanded, onToggle }: ExpandProps) => {
  const { t } = useTranslation('workspaces');
  return (
    <div className="flex justify-end bg-white">
      <div className="flex flex-1 items-center pl-4 whitespace-nowrap mr-5 text-[0.75rem] text-pr-grey">
        <a href="https://prisme.ai" target="_blank" rel="noreferrer">
          {t('powered', { ns: 'common' })}
        </a>
      </div>
      <Tooltip
        title={t('workspace.sidebar', {
          context: expanded ? 'minimize' : 'extend',
        })}
        placement="right"
      >
        <DoubleLeftOutlined
          className={`text-[0.8rem] m-2 mr-6 transition-all ${
            expanded ? '' : 'rotate-180'
          }`}
          onClick={onToggle}
        />
      </Tooltip>
    </div>
  );
};

export default Expand;
