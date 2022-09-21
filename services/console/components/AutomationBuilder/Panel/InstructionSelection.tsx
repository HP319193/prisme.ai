import {
  Button,
  ListItem,
  SearchInput,
  Space,
  Title,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { FC, useMemo, useState } from 'react';
import { useAutomationBuilder } from '../context';
import { truncate } from '../../../utils/strings';

export interface InstructionSelectionProps {
  onSubmit: (key: string) => void;
  focus?: true;
}

export const InstructionSelection: FC<InstructionSelectionProps> = ({
  onSubmit,
  focus,
}) => {
  const { t } = useTranslation('workspaces');
  const { instructionsSchemas } = useAutomationBuilder();

  const [search, setSearch] = useState('');
  const filteredInstructions = useMemo(() => {
    return instructionsSchemas
      .reduce<
        [
          string,
          string,
          { name: string; description?: string; slug: string }[]
        ][]
      >((prev, [name, list, more]) => {
        const matching = (
          search
            ? Object.keys(list).filter((a) =>
                `${name} ${a}`.toLowerCase().includes(search.toLowerCase())
              )
            : Object.keys(list)
        ).map((name) => ({
          name: list[name]?.name || name,
          slug: name,
          description: (list[name] || {}).description,
        }));
        if (!matching) return prev;
        return [...prev, [name, more.icon, matching]];
      }, [])
      .filter(([, , list]) => list.length);
  }, [instructionsSchemas, search]);

  return (
    <div className="flex grow h-full flex-col overflow-auto">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('automations.instruction.search')}
        autoFocus={focus}
        className="mb-6"
      />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {filteredInstructions.map(([section, icon, instructions], index) => (
          <Space
            key={section}
            direction="vertical"
            className={`!flex flex-1 ${index !== 0 ? 'mt-8' : ''}`}
          >
            <div className="flex flex-row items-center space-x-3">
              {icon && ( // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} width={16} height={16} alt={section} />
              )}
              <Title level={4} className="!mb-0">
                {section}
              </Title>
            </div>
            <Space direction="vertical" className="!flex flex-1">
              {instructions.map(({ name, description, slug }) => (
                <Button
                  key={slug}
                  onClick={() => onSubmit(slug)}
                  className="w-full text-left !h-fit"
                >
                  <ListItem
                    title={t('automations.instruction.label', {
                      context: name,
                    })}
                    content={
                      <Tooltip
                        title={t('automations.instruction.description', {
                          context: name,
                          default: description,
                        })}
                      >
                        <div className="text-xs">
                          {truncate(
                            t('automations.instruction.description', {
                              context: name,
                              default: description,
                            }),
                            30,
                            '…'
                          )}
                        </div>
                      </Tooltip>
                    }
                  />
                </Button>
              ))}
            </Space>
          </Space>
        ))}
      </Space>
    </div>
  );
};

export default InstructionSelection;
