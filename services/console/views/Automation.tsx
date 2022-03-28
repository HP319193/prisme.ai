import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutomationBuilder from '../components/AutomationBuilder';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Loading,
  notification,
  PageHeader,
  Space,
} from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import useLocalizedText from '../utils/useLocalizedText';
import { usePrevious } from '../utils/usePrevious';
import { Schema } from '../components/SchemaForm/types';
import { SLUG_VALIDATION_REGEXP } from '../utils/regex';
import EditDetails from '../layouts/EditDetails';
import ArgumentsEditor from '../components/SchemaFormBuilder/ArgumentsEditor';

export const Automation = () => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const { workspace, updateAutomation, deleteAutomation } = useWorkspace();
  const { getAppInstances, appInstances } = useApps();
  useEffect(() => {
    getAppInstances(workspace.id);
  }, [getAppInstances, workspace.id]);

  const {
    query: { automationId },
    push,
    replace,
  } = useRouter();

  const automation = (workspace.automations || {})[`${automationId}`];
  const [value, setValue] = useState<Prismeai.Automation>(automation || {});
  const [saving, setSaving] = useState(false);
  const prevAutomationId = usePrevious(automationId);
  const automationDidChange = useRef(true);

  useEffect(() => {
    if (automationDidChange.current && prevAutomationId !== automationId) {
      setValue(automation);
    }
    automationDidChange.current = true;
  }, [automation, automationId, prevAutomationId]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          title: t('automations.details.slug.label'),
          pattern: SLUG_VALIDATION_REGEXP.source,
        },
        name: {
          type: 'string',
          title: t('automations.details.name.label'),
          'ui:options': { localizedText: true },
        },
        description: {
          'ui:widget': 'textarea',
          title: t('automations.details.description.label'),
          'ui:options': { rows: 5, localizedText: true },
        },
        arguments: {
          'ui:widget': ArgumentsEditor,
        },
      },
      'ui:options': {
        layout: 'columns',
        columns: [['slug', 'name', 'description'], ['arguments']],
      },
      'ui:options': {
        layout: 'columns',
        columns: [['slug', 'name'], ['description']],
      },
    }),
    [t]
  );

  const saveAutomation = useRef(
    async (automationId: string, automation: Prismeai.Automation) => {
      setSaving(true);
      try {
        const saved = await updateAutomation(automationId, automation);
        if (!saved) {
          throw new Error('not saved');
        }
        notification.success({
          message: t('automations.save.toast'),
          placement: 'bottomRight',
        });
        setSaving(false);
        return saved;
      } catch (e) {
        notification.error({
          message: t('automations.save.error'),
          placement: 'bottomRight',
        });
        setSaving(false);
        return null;
      }
    }
  );

  const save = useCallback(async () => {
    await saveAutomation.current(`${automationId}`, value);
  }, [automationId, value]);

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
    push(`/workspaces/${workspace.id}`);
    deleteAutomation(`${automationId}`);
    notification.success({
      message: t('details.delete.toast', { context: 'automations' }),
      placement: 'bottomRight',
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

  const updateDetails = useCallback(
    async ({
      slug,
      name,
      description,
      arguments: args,
    }: {
      slug: string;
      name: Prismeai.LocalizedText;
      description: Prismeai.LocalizedText;
      arguments: Prismeai.Automation['arguments'];
    }) => {
      const { slug: prevSlug } = value;
      const cleanedArguments =
        args &&
        Object.keys(args).reduce(
          (prev, key) => (key ? { ...prev, [key]: args[key] } : prev),
          {}
        );
      const newValue = {
        ...value,
        name,
        slug,
        description,
        arguments: cleanedArguments,
      };
      setValue(newValue);
      automationDidChange.current = false;
      await saveAutomation.current(`${automationId}`, newValue);
      if (prevSlug === slug) return;
      replace(`/workspaces/${workspace.id}/automations/${slug}`, undefined, {
        shallow: true,
      });
    },
    [automationId, replace, value, workspace.id]
  );

  if (!value) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-row items-center">
            {localize(value.name)}
            <EditDetails
              schema={detailsFormSchema}
              value={{ ...value, slug: automationId }}
              onSave={updateDetails}
              onDelete={confirmDeleteAutomation}
              context="automations"
            />
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
