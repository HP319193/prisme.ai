import { Space } from 'antd';
import { SearchInput } from '../';
import { useTranslation } from 'react-i18next';

export interface SidePanelAutomationsProps {}

const SidePanelAutomations = ({}: SidePanelAutomationsProps) => {
  const { t } = useTranslation('workspaces');
  return (
    <Space>
      <SearchInput placeholder={t('search')} />
    </Space>
  );
};

export default SidePanelAutomations;
