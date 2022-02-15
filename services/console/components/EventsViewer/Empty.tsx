import { Button } from '@prisme.ai/design-system';
import { Trans, useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import icon from '../../icons/workspace.svg';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { useWorkspaces } from '../WorkspacesProvider';

export const Empty = () => {
  const { t } = useTranslation('workspaces');
  const [creating, setCreating] = useState(false);
  const { createAutomation } = useWorkspaces();
  const { workspace } = useWorkspace();
  const { push } = useRouter();
  const createNewAutomation = useCallback(async () => {
    setCreating(true);

    const createdAutomation = await createAutomation(workspace, {
      name: t('automations.create.defaultName'),
      do: [],
    });

    setCreating(false);
    if (createdAutomation) {
      await push(
        `/workspaces/${workspace.id}/automations/${createdAutomation.slug}`
      );
    }
  }, []);
  return (
    <div className="flex flex-1 justify-around items-center flex-col">
      <Image src={icon.src} width={293} height={227} alt="" />
      <div>
        <Trans
          t={t}
          i18nKey="workspace.empty"
          components={{
            button: <Button variant="grey" onClick={createNewAutomation} />,
          }}
        />
      </div>
    </div>
  );
};
export default Empty;
