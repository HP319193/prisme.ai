import { Space } from 'antd';
import { SearchInput, Button, ListItem, Title } from '../';
import { useTranslation } from 'react-i18next';

export interface SidePanelAutomationsProps {
  automations: {
    title: string;
    content: string;
  }[];
}

const SidePanelAutomations = ({ automations }: SidePanelAutomationsProps) => {
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex grow h-full flex-col">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          {t('automations.title')}
        </Title>
        <Button>{t('automations.add')}</Button>
      </div>
      <SearchInput placeholder={t('search')} className="mb-6" />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {automations &&
          automations.map(({ title, content }) => (
            <ListItem title={title} content={content} key={title} />
          ))}
      </Space>
    </div>
  );
};

export default SidePanelAutomations;
