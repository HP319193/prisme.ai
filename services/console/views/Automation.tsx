import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AutomationBuilder from '../components/AutomationBuilder';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Dropdown,
  EditableTitle,
  Loading,
  Menu,
  Modal,
  notification,
  PageHeader,
  Space,
} from '@prisme.ai/design-system';
import { DeleteOutlined } from '@ant-design/icons';
import { useApps } from '../components/AppsProvider';
import useLocalizedText from '../utils/useLocalizedText';
import { usePrevious } from '../utils/usePrevious';

export const Automation = () => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const { workspace } = useWorkspace();
  const { updateAutomation, deleteAutomation } = useWorkspaces();
  const { getAppInstances, appInstances } = useApps();

  useEffect(() => {
    getAppInstances(workspace.id);
  }, [getAppInstances, workspace.id]);

  const {
    query: { automationId },
    push,
  } = useRouter();
  const automation = (workspace.automations || {})[`${automationId}`];
  const [value, setValue] = useState<Prismeai.Automation>(automation || {});
  const [saving, setSaving] = useState(false);
  const prevAutomationId = usePrevious(automationId);

  useEffect(() => {
    if (prevAutomationId !== automationId) {
      setValue(automation);
    }
  }, [automation, automationId, prevAutomationId]);

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

  const confirmDeleteAutomation = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('automations.delete.confirm.title', {
        name: automationId,
      }),
      content: t('automations.delete.confirm.content'),
      cancelText: t('automations.delete.confirm.ok'),
      okText: t('automations.delete.confirm.cancel'),
      onCancel: () => {
        push(`/workspaces/${workspace.id}`);
        deleteAutomation(workspace, `${automationId}`);
        notification.success({
          message: t('automations.delete.toast'),
          placement: 'bottomRight',
        });
      },
    });
  }, [automationId, deleteAutomation, push, t, workspace]);

  const customInstructions = useMemo(
    () =>
      (appInstances.get(workspace.id) || []).map(
        ({ slug: appSlug, automations, appName }) => ({
          appName: `${appSlug} (${appName})`,
          icon: '',
          automations: automations.reduce(
            (prev, { slug, name, description, ...rest }) => ({
              ...prev,
              [`${appSlug}.${slug}`]: {
                name: localize(name) || '',
                description: localize(description) || '',
                ...rest,
              },
            }),
            {}
          ),
        })
      ),
    [appInstances, localize, workspace.id]
  );

  if (!value) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }
  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-row items-center">
            <EditableTitle
              value={value.name}
              onChange={updateTitle}
              level={4}
              className="!m-0 !ml-4"
            />
            <Dropdown
              Menu={
                <Menu
                  items={[
                    {
                      label: (
                        <div className="flex items-center">
                          <DeleteOutlined className="mr-2" />
                          {t('automations.delete.label')}
                        </div>
                      ),
                      key: 'delete',
                    },
                  ]}
                  onClick={confirmDeleteAutomation}
                />
              }
            >
              <div className="mx-1" />
            </Dropdown>
          </div>
        }
        onBack={() => push(`/workspaces/${workspace.id}`)}
        RightButtons={[
          <Button
            onClick={save}
            disabled={saving}
            key="1"
            className="!flex flex-row"
          >
            <Space>
              {t('automations.save.label')}
              {saving && <Loading />}
            </Space>
          </Button>,
        ]}
      />
      <div className="relative flex flex-1">
        <AutomationBuilder
          id={`${automationId}`}
          value={value}
          onChange={setValue}
          customInstructions={customInstructions}
        />
      </div>
    </>
  );
};

Automation.getLayout = getLayout;

export default Automation;
