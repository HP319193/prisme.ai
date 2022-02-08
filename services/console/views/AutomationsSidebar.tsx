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
import { useWorkspaces } from '../components/WorkspacesProvider';
import useLocalizedText from '../utils/useLocalizedText';

interface AutomationsSidebarProps {
  onClose: () => void;
}

const emptyObject: Prismeai.Workspace['automations'] = {};

export const AutomationsSidebar: FC<AutomationsSidebarProps> = ({
  onClose,
}) => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
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
  }, [filter]);

  const { createAutomation } = useWorkspaces();

  const [creating, setCreating] = useState(false);

  const generateAutomationName = useCallback(() => {
    const defaultName = t('automations.create.defaultName');
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ''}`;
    const names = Object.keys(automations).map((key) => automations[key].name);
    while (names.find((name) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [automations, t]);

  const create = useCallback(async () => {
    setCreating(true);

    const name = generateAutomationName();
    const createdAutomation = await createAutomation(workspace, {
      name,
      when: {
        events: [t('automations.create.value.event')],
      },
      do: [
        {
          emit: {
            event: t('automations.create.value.event'),
          },
        },
      ],
    });

    setCreating(false);
    onClose();
    if (createdAutomation) {
      await push(
        `/workspaces/${workspaceId}/automations/${createdAutomation.slug}`
      );
    }
  }, [
    generateAutomationName,
    createAutomation,
    workspace,
    t,
    onClose,
    push,
    workspaceId,
  ]);

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
      <SearchInput
        placeholder={t('search')}
        className="mb-6"
        onChange={({ target: { value } }) => setFilter(value)}
      />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {filteredAutomations.map(({ name, description, slug }) => (
          <Link
            key={slug}
            href={`/workspaces/${workspaceId}/automations/${slug}`}
          >
            <a onClick={onClose}>
              <ListItem title={name} content={localize(description)} />
            </a>
          </Link>
        ))}
      </Space>
    </div>
  );
};

export default AutomationsSidebar;
