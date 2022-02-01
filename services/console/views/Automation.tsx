import { useRouter } from "next/router";
import Link from 'next/link'
import { useEffect, useState, useCallback } from "react";
import AutomationBuilder from "../components/AutomationBuilder";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";
import Error404 from "./Errors/404";
import EditableTitle from '../components/EditableTitle';
import { Button } from "primereact/button";
import useKeyboardShortcut from "../components/useKeyboardShortcut";
import { useWorkspaces } from "../components/WorkspacesProvider";
import { useTranslation } from "next-i18next";

export const Automation = () => {
  const { t } = useTranslation('workspaces')
  const { workspace } = useWorkspace();
  const { updateAutomation } = useWorkspaces();
  const {
    query: { automationId },
  } = useRouter();
  const automation = (workspace.automations || {})[`${automationId}`];
  const [value, setValue] = useState<Prismeai.Automation>(automation);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(automation)
  }, [automation])

  const updateTitle = useCallback((newTitle: string) => {
    if (!newTitle || Object.keys(workspace.automations).includes(newTitle)) {
      return;
    }
    setValue({ ...value, name: newTitle })
  }, [value, workspace.automations])

  const save = useCallback(async () => {
    setSaving(true);
    const saved = await updateAutomation(workspace, `${automationId}`, value)
    if (saved) {
      setValue(saved);
    }
    setSaving(false)
  }, [automationId, updateAutomation, value, workspace])

  useKeyboardShortcut([{
    key: 's',
    meta: true,
    command: (e) => {
      e.preventDefault();
      save()
    }
  }])
  if (!automation) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }
  return (
    <>
      <div className="flex flex-row justify-content-between bg-white">
        <div className="flex flex-row align-items-center">
          <Link href={`/workspaces/${workspace.id}`}>{t('automations.back')}</Link>
          <EditableTitle title={value.name} onChange={updateTitle} />
        </div>
        <div className="flex flex-row align-items-center">
          <Button onClick={save} disabled={saving}>
            {saving && <i className="pi pi-spin pi-spinner absolute -ml-3" />}
            {t('automations.save.label')}
          </Button>
        </div>
      </div>
      <AutomationBuilder id={`${automationId}`} value={value} onChange={setValue} />
    </>
  );
};

Automation.getLayout = getLayout;

export default Automation;
