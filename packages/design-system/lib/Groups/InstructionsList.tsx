import { Space } from 'antd';
import { SearchInput, Button, ListItem, Title } from '../';
import { useTranslation } from 'react-i18next';

type instruction = {
  label: string;
  value: string;
};

export interface InstructionsListProps {
  instructionsCategories: {
    [key: string]: instruction[];
  };
}

const InstructionsList = ({
  instructionsCategories,
}: InstructionsListProps) => {
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex grow h-full flex-col">
      <SearchInput placeholder={t('search')} className="mb-6" />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {instructionsCategories &&
          Object.entries(instructionsCategories).map(([key, instructions]) => (
            <div>
              <Title level={4}>{key}</Title>
              <Space direction="vertical" className="flex grow overflow-x-auto">
                {instructions.map(({ label, value }) => (
                  <ListItem title={label} key={value} />
                ))}
              </Space>
            </div>
          ))}
      </Space>
    </div>
  );
};

export default InstructionsList;
