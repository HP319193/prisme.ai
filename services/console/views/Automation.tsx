import { useRouter } from 'next/router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AutomationBuilder from '../components/AutomationBuilder';
import getLayout from '../layouts/WorkspaceLayout';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import {
  Button,
  Loading,
  notification,
  Schema,
  Space,
} from '@prisme.ai/design-system';
import useLocalizedText from '../utils/useLocalizedText';
import { SLUG_VALIDATION_REGEXP } from '../utils/regex';
import EditDetails from '../layouts/EditDetails';
import ArgumentsEditor from '../components/SchemaFormBuilder/ArgumentsEditor';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';
import EditableTitle from '../components/AutomationBuilder/EditableTitle';
import { PageHeader, Tooltip } from 'antd';
import HorizontalSeparatedNav from '../components/HorizontalSeparatedNav';
import { CodeOutlined } from '@ant-design/icons';
import CopyIcon from '../icons/copy.svgr';
import iconWorkspace from '../icons/icon-workspace.svg';

import { useWorkspace } from '../providers/Workspace';
import { AutomationProvider, useAutomation } from '../providers/Automation';
import { ApiError } from '../utils/api';

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
  const {
    automation,
    saveAutomation,
    saving,
    deleteAutomation,
  } = useAutomation();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace } = useWorkspace();
  const { setDirty } = useWorkspaceLayout();
  const [value, setValue] = useState(automation);

  const {
    query: { automationId },
    push,
    replace,
  } = useRouter();

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
          errors: {
            pattern: t('automations.save.error_InvalidSlugError'),
          },
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
        disabled: {
          type: 'boolean',
          title: t('automations.details.disabled.label'),
          description: t('automations.details.private.description'),
        },
      },
      'ui:options': {
        grid: [
          [['name', 'slug'], ['description']],
          [['arguments']],
          [['private']],
          [['disabled']],
        ],
      },
    }),
    [t]
  );

  const save = useCallback(
    async (newValue = value) => {
      if (newValue !== value) setValue(newValue);
      try {
        const saved = await saveAutomation(cleanAutomation(newValue));
        setDirty(false);
        saved && setValue(saved);
        notification.success({
          message: t('automations.save.toast'),
          placement: 'bottomRight',
        });
      } catch (e) {
        const { details, error } = e as ApiError;

        notification.error({
          message: t('automations.save.error', {
            context: Object.keys(details || {})[0],
          }),
          placement: 'bottomRight',
        });
        if (error === 'InvalidSlugError') {
          details.slug = t('automations.save.error_InvalidSlugError');
        }
      }
    },
    [saveAutomation, setDirty, t, value]
  );

  // Need to get the latest version with the latest value associated
  const saveAfterChange = useRef(save);
  useEffect(() => {
    saveAfterChange.current = save;
  }, [save]);

  const saveDetails = useCallback(
    async ({
      slug,
      name,
      description,
      arguments: args,
      private: _private,
      disabled,
    }: Prismeai.Automation) => {
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
        disabled,
        name,
        slug,
        description,
        arguments: cleanedArguments,
      };
      if (_private) {
        newValue.private = true;
      }
      save(newValue);
      if (prevSlug === slug) return;
      replace(`/workspaces/${workspace.id}/automations/${slug}`, undefined, {
        shallow: true,
      });
    },
    [replace, save, value, workspace.id]
  );

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
    deleteAutomation();
    notification.success({
      message: t('details.delete.toast', { context: 'automations' }),
      placement: 'bottomRight',
    });
  }, [deleteAutomation, push, t, workspace]);

  const customInstructions = useMemo(
    () => [
      {
        appName: localize(workspace.name),
        automations: workspace.automations,
        icon: iconWorkspace.src,
      },
      ...Object.entries(workspace.imports || {}).map(
        ([appSlug, { automations, appName, photo = '' }]) => ({
          appName: `${appSlug} (${appName})`,
          icon: photo,
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
    ],
    [localize, workspace.automations, workspace.imports, workspace.name]
  );

  const duplicate = useCallback(() => {
    alert('coming soon');
  }, []);

  const showSource = useCallback(() => {
    alert('coming soon');
  }, []);

  return (
    <>
      <PageHeader
        className="h-[4rem] flex items-center"
        title={
          <HorizontalSeparatedNav>
            <HorizontalSeparatedNav.Separator>
              <span className="pr-page-title">
                <EditableTitle
                  value={value.name}
                  onChange={(name) =>
                    setValue({
                      ...value,
                      name,
                    })
                  }
                  onEnter={() => {
                    // Need to wait after the onChange changed the value
                    setTimeout(() => saveAfterChange.current(), 1);
                  }}
                  className="text-base font-bold max-w-[35vw]"
                />
              </span>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip
                title={t('details.title', { context: 'automations' })}
                placement="bottom"
              >
                <EditDetails
                  schema={detailsFormSchema}
                  value={value}
                  onSave={saveDetails}
                  onDelete={confirmDeleteAutomation}
                  context="automations"
                  key={`${automationId}`}
                />
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip
                title={t('automations.duplicate.help')}
                placement="bottom"
              >
                <button
                  className="flex flex-row focus:outline-none items-center pr-4"
                  onClick={duplicate}
                >
                  <span className="mr-2">
                    <CopyIcon width="1.2rem" height="1.2rem" />
                  </span>
                  {t('duplicate', { ns: 'common' })}
                </button>
              </Tooltip>
              <Tooltip title={t('automations.source.help')} placement="bottom">
                <button
                  className="flex flex-row focus:outline-none items-center"
                  onClick={showSource}
                >
                  <span className="mr-2">
                    <CodeOutlined width="1.2rem" height="1.2rem" />
                  </span>
                  {t('automations.source.label')}
                </button>
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        extra={[
          <Button
            onClick={() => save()}
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
      <Head>
        <title>
          {t('page_title', {
            elementName: localize((automation || { name: '' }).name),
          })}
        </title>
      </Head>
      <div className="relative flex flex-1 h-full">
        <AutomationBuilder
          id={`${automationId}`}
          workspaceId={workspace.id}
          value={value}
          onChange={setValue}
          customInstructions={customInstructions}
        />
      </div>
    </>
  );
};

export const AutomationWithProvider = () => {
  const { workspace } = useWorkspace();
  const {
    query: { automationId },
  } = useRouter();

  return (
    <AutomationProvider
      workspaceId={workspace.id}
      automationSlug={`${automationId}`}
    >
      <Automation />
    </AutomationProvider>
  );
};
AutomationWithProvider.getLayout = getLayout;
export default AutomationWithProvider;
