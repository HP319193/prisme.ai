import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@prisme.ai/design-system';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useWorkspaces } from '../components/WorkspacesProvider';

interface AutomationsSidebarProps {
  onClose: () => void;
}

const emptyObject: Prismeai.Workspace['automations'] = {};

export const AutomationsSidebar: FC<AutomationsSidebarProps> = ({
  onClose,
}) => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const {
    workspace,
    workspace: { id: workspaceId, automations = emptyObject },
  } = useWorkspace();

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
    <div>
      <div>{t('automations.link')}</div>
      <div>
        <Button onClick={create} disabled={creating}>
          <div
            className={`mr-2 pi ${creating ? 'pi-spin pi-spinner' : 'pi-plus'}`}
          />
          {t('automations.create.label')}
        </Button>
      </div>
      {Object.keys(automations).map((key) => (
        <div
          key={key}
          onClick={onClose}
          className="flex justify-content-between align-items-center"
        >
          <Link href={`/workspaces/${workspaceId}/automations/${key}`}>
            {automations[key].name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AutomationsSidebar;
