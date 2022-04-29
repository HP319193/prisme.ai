import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Button,
  ListItem,
  SearchInput,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import useLocalizedText from '../utils/useLocalizedText';
import IconAutomations from '../icons/icon-automations.svgr';

const emptyObject: Prismeai.Workspace['automations'] = {};

export const AutomationsSidebar: FC = () => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation();
  const { localize } = useLocalizedText();
  const { push } = useRouter();
  const {
    workspace,
    workspace: { id: workspaceId, automations = emptyObject },
  } = useWorkspace();

  const [filter, setFilter] = useState('');

  const filteredAutomations = useMemo(() => {
    return Object.keys(automations).flatMap((key) => {
      const { name, description = '' } = automations[key];
      return `${name} ${description}`.toLowerCase().match(filter.toLowerCase())
        ? { ...automations[key], slug: key }
        : [];
    });
  }, [filter, automations]);

  const { createAutomation } = useWorkspace();

  const [creating, setCreating] = useState(false);

  const generateAutomationName = useCallback(() => {
    const defaultName = t('automations.create.defaultName');
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ''}`;
    const names = Object.keys(automations).map((key) =>
      localize(automations[key].name)
    );
    while (names.find((name) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [automations, localize, t]);

  const create = useCallback(async () => {
    setCreating(true);

    const name = generateAutomationName();
    const createdAutomation = await createAutomation({
      name,
      do: [],
    });

    setCreating(false);
    if (createdAutomation) {
      await push(
        `/workspaces/${workspaceId}/automations/${createdAutomation.slug}`
      );
    }
  }, [generateAutomationName, createAutomation, push, workspaceId]);

  const isEmpty = Object.keys(automations).length === 0;

  return (
    <div className="flex grow h-full flex-col">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          {t('automations.link')}
        </Title>
        <Button onClick={create} disabled={creating}>
          {t('automations.create.label')}
        </Button>
      </div>
      {isEmpty && (
        <Button
          className="!flex flex-1 justify-center items-center flex-col"
          variant="link"
          onClick={create}
          disabled={creating}
        >
          <IconAutomations height={100} width={100} className="text-gray-200" />
          <div className="mt-4 text-gray">{t('automations.empty')}</div>
          {t('automations.create.label')}
        </Button>
      )}
      {!isEmpty && (
        <>
          <SearchInput
            placeholder={commonT('search')}
            className="mb-6"
            onChange={({ target: { value } }) => setFilter(value)}
          />
          <Space direction="vertical" className="flex grow overflow-x-auto">
            {filteredAutomations.map(({ name, description, slug }) => (
              <Link
                key={slug}
                href={`/workspaces/${workspaceId}/automations/${slug}`}
              >
                <a>
                  <ListItem
                    title={localize(name)}
                    content={localize(description)}
                  />
                </a>
              </Link>
            ))}
          </Space>
        </>
      )}
    </div>
  );
};

export default AutomationsSidebar;
