import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutomationBuilder from '../components/AutomationBuilder';
import getLayout from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Loading,
  notification,
  PageHeader,
  Schema,
  Space,
} from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import useLocalizedText from '../utils/useLocalizedText';
import { SLUG_VALIDATION_REGEXP } from '../utils/regex';
import EditDetails from '../layouts/EditDetails';
import ArgumentsEditor from '../components/SchemaFormBuilder/ArgumentsEditor';
import { ApiError } from '../utils/api';
import { useWorkspace } from '../components/WorkspaceProvider';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';
import { usePrevious } from '../utils/usePrevious';

const cleanInstruction = (instruction: Prismeai.Instruction) => {
  const [type] = Object.keys(instruction);
  if (type === 'conditions') {
    cleanConditions(instruction as { conditions: Prismeai.Conditions });
  }
  if (type === 'repeat') {
    cleanDo((instruction as Prismeai.Repeat).repeat);
  }
  if (type === 'all') {
    cleanDo(instruction as Prismeai.All);
  }
};
const cleanConditions = (instruction: { conditions: Prismeai.Conditions }) => {
  Object.keys(instruction.conditions).forEach((key) => {
    instruction.conditions[key] = instruction.conditions[key].filter(
      (i) => Object.keys(i).length === 1
    );
    instruction.conditions[key].forEach(cleanInstruction);
  });
};
const isDoList = (
  parent: { do: Prismeai.InstructionList } | { all: Prismeai.InstructionList }
): parent is { do: Prismeai.InstructionList } => {
  return !!(parent as { do: Prismeai.InstructionList }).do;
};
const isAllList = (
  parent: { do: Prismeai.InstructionList } | { all: Prismeai.InstructionList }
): parent is { all: Prismeai.InstructionList } => {
  return !!(parent as { all: Prismeai.InstructionList }).all;
};
const cleanDo = (
  parent: Prismeai.Automation | Prismeai.Repeat['repeat'] | Prismeai.All
) => {
  const filter = (instruction: Prismeai.Instruction) =>
    Object.keys(instruction).length === 1;
  let doList: Prismeai.InstructionList = [];
  if (isDoList(parent)) {
    doList = parent.do = parent.do.filter(filter);
  }
  if (isAllList(parent)) {
    doList = parent.all = parent.all.filter(filter);
  }
  doList.forEach(cleanInstruction);
};
const cleanAutomation = (automation: Prismeai.Automation) => {
  if (!automation.do) return automation;
  cleanDo(automation);
  return automation;
};

export const Automation = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace, updateAutomation, deleteAutomation } = useWorkspace();
  const { setDirty } = useWorkspaceLayout();
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
  const prevAutomationId = usePrevious(automationId);

  const [value, setValue] = useState<Prismeai.Automation>(automation || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(automation);
  }, [automation]);

  useEffect(() => {
    if (!value) return;
    const { slug, ...valueWithoutSlug } = value;

    if (
      automationId === prevAutomationId &&
      JSON.stringify(automation) !== JSON.stringify(valueWithoutSlug)
    ) {
      setDirty(true);
    }
  }, [value, automationId, prevAutomationId, setDirty, automation]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('automations.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('automations.details.slug.label'),
          pattern: SLUG_VALIDATION_REGEXP.source,
        },
        description: {
          type: 'localized:string',
          title: t('automations.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 6 } },
        },
        arguments: {
          'ui:widget': ArgumentsEditor,
        },
        private: {
          type: 'boolean',
          title: t('automations.details.private.label'),
          description: t('automations.details.private.description'),
        },
      },
      'ui:options': {
        grid: [
          [['name', 'slug'], ['description']],
          [['arguments']],
          [['private']],
        ],
      },
    }),
    [t]
  );

  const saveAutomation = useRef(
    async (automationId: string, automation: Prismeai.Automation) => {
      setSaving(true);
      try {
        const saved = await updateAutomation(
          automationId,
          cleanAutomation(automation)
        );
        notification.success({
          message: t('automations.save.toast'),
          placement: 'bottomRight',
        });
        console.log('false');
        setDirty(false);
        setSaving(false);
        return saved;
      } catch (e) {
        const { details } = e as ApiError;
        notification.error({
          message: t('automations.save.error', {
            context: Object.keys(details || {})[0],
          }),
          placement: 'bottomRight',
        });
        setSaving(false);
        throw details;
      }
    }
  );

  const save = useCallback(async () => {
    const saved = await saveAutomation.current(`${automationId}`, value);
    saved && setValue({ ...saved });
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
      private: _private,
    }: {
      slug: string;
      name: Prismeai.LocalizedText;
      description: Prismeai.LocalizedText;
      arguments: Prismeai.Automation['arguments'];
      private: boolean;
    }) => {
      const { slug: prevSlug } = value;
      const cleanedArguments =
        args &&
        Object.keys(args).reduce(
          (prev, key) => (key ? { ...prev, [key]: args[key] } : prev),
          {}
        );
      const { private: p, ...cleanedValue } = value;
      const newValue: typeof value = {
        ...cleanedValue,
        name,
        slug,
        description,
        arguments: cleanedArguments,
      };
      if (_private) {
        newValue.private = true;
      }
      setValue(newValue);
      try {
        await saveAutomation.current(`${automationId}`, newValue);
        if (prevSlug === slug) return;
        replace(`/workspaces/${workspace.id}/automations/${slug}`, undefined, {
          shallow: true,
        });
      } catch (e) {
        return e as Record<string, string>;
      }
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
          <div className="flex flex-row items-center text-base">
            <span className="font-medium">{localize(value.name)}</span>
            {/*<span className="w-[20px]" />*/}
            {/*<span className="border-l border-solid border-pr-grey text-gray flex h-[26px] w-[20px]" />*/}
            <span className="text-gray flex">
              <EditDetails
                schema={detailsFormSchema}
                value={{ ...value, slug: automationId }}
                onSave={updateDetails}
                onDelete={confirmDeleteAutomation}
                context="automations"
                key={`${automationId}`}
              />
            </span>
          </div>
        }
        RightButtons={[
          <Button
            onClick={save}
            disabled={saving}
            key="1"
            className="!flex flex-row"
            variant="primary"
          >
            <Space>
              {t('automations.save.label')}
              {saving && <Loading />}
            </Space>
          </Button>,
        ]}
      />

      <div className="relative flex flex-1 h-full">
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
