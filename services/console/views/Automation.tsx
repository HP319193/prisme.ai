import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import AutomationBuilder from '../components/AutomationBuilder';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import { Button, PageHeader } from '@prisme.ai/design-system';
import { LoadingOutlined } from '@ant-design/icons';
import { notification } from 'antd';

export const Automation = () => {
  const { t } = useTranslation('workspaces');
  const { workspace } = useWorkspace();
  const { updateAutomation } = useWorkspaces();

  const {
    query: { automationId },
    push,
  } = useRouter();
  const automation = (workspace.automations || {})[`${automationId}`];
  const [value, setValue] = useState<Prismeai.Automation>(automation || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(automation);
  }, [automation]);

  const updateTitle = useCallback(
    (newTitle: string) => {
      if (!newTitle || Object.keys(workspace.automations).includes(newTitle)) {
        return;
      }
      setValue({ ...value, name: newTitle });
    },
    [value, workspace.automations]
  );

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await updateAutomation(workspace, `${automationId}`, value);
      if (saved) {
        setValue(saved);
      }
      notification.success({
        message: t('automations.save.toast'),
        placement: 'bottomRight',
      });
    } catch (e) {
      notification.error({
        message: t('automations.save.error'),
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [automationId, t, updateAutomation, value, workspace]);

  useKeyboardShortcut([
    {
      key: 's',
      meta: true,
      command: (e) => {
        e.preventDefault();
        save();
      },
    },
  ]);
  if (!value) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }
  return (
    <>
      <PageHeader
        title={value.name}
        onBack={() => push(`/workspaces/${workspace.id}`)}
        RightButtons={[
          <Button onClick={save} disabled={saving} key="1">
            {saving && <LoadingOutlined />}
            {t('automations.save.label')}
          </Button>,
        ]}
      />
      <div className="relative flex flex-1">
        <AutomationBuilder
          id={`${automationId}`}
          value={value}
          onChange={setValue}
        />
      </div>
    </>
  );
};

Automation.getLayout = getLayout;

export default Automation;
