import { Loading, Schema, SchemaForm } from '@prisme.ai/design-system';
import { Tabs, TabsProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import useLocalizedText from '../../../utils/useLocalizedText';
import useSchema from '../../SchemaForm/useSchema';
import { usePageBuilder } from '../context';
import useBlockPageConfig from '../useBlockPageConfig';
import { useWorkspace } from '../../../providers/Workspace';
import components from '../../SchemaForm/schemaFormComponents';
import { mergeAndCleanObjects } from '../../../utils/objects';
import api from '../../../utils/api';

interface SettingsProps {
  removeBlock: () => void;
  schema?: Schema | null;
  blockId: string;
}

export const Settings = ({ removeBlock, schema, blockId }: SettingsProps) => {
  const { t } = useTranslation('workspaces');
  const { value } = usePageBuilder();
  const {
    workspace: { automations, pages, id: workspaceId },
  } = useWorkspace();
  const { config, onConfigUpdate } = useBlockPageConfig({
    blockId,
  });
  const { onInit, updateOn, automation, sectionId, ...initialConfigBlocks } =
    config;
  const initialConfigAdvanced = { onInit, updateOn, automation, sectionId };
  const [configBlock, setConfigBlock] = useState(initialConfigBlocks);
  const [configAdvanced, setConfigAdvanced] = useState(initialConfigAdvanced);

  const mergeConfig = useCallback(
    (block: typeof configBlock, advanced: typeof configAdvanced) => {
      onConfigUpdate({
        ...block,
        ...advanced,
      });
    },
    [onConfigUpdate]
  );

  const debouncedMergeConfig = useMemo(
    () =>
      debounce(
        (
          block: Parameters<typeof mergeConfig>[0],
          advanced: Parameters<typeof mergeConfig>[1]
        ) => {
          mergeConfig(block, advanced);
        },
        500
      ),
    [mergeConfig]
  );

  useEffect(() => {
    debouncedMergeConfig(configBlock, configAdvanced);
  }, [configAdvanced, configBlock, debouncedMergeConfig, mergeConfig]);

  const { extractSelectOptions } = useSchema({
    pageSections: Array.from(value.values()).flatMap(
      ({ config: { sectionId } = {} }) => (sectionId ? sectionId : [])
    ),
    automations,
    pages,
  });
  const { localizeSchemaForm } = useLocalizedText();

  const commonSchema: Schema = useMemo(
    () =>
      localizeSchemaForm({
        type: 'object',
        properties: {
          onInit: {
            type: 'string',
            title: 'pages.blocks.settings.onInit.label',
            description: 'pages.blocks.settings.onInit.description',
          },
          updateOn: {
            type: 'string',
            title: 'pages.blocks.settings.updateOn.label',
            description: 'pages.blocks.settings.updateOn.description',
          },
          automation: {
            type: 'string',
            title: 'pages.blocks.settings.automation.label',
            description: 'pages.blocks.settings.automation.description',
            'ui:widget': 'select',
            'ui:options': {
              from: 'automations',
              filter: 'endpoint',
            },
          },
          sectionId: {
            type: 'string',
            title: 'pages.blocks.settings.sectionId.label',
            description: 'pages.blocks.settings.sectionId.description',
          },
        },
      }),
    [localizeSchemaForm]
  );

  const locales = useMemo(
    () => ({
      addItem: t('automations.instruction.form.addItem'),
      addProperty: t('automations.instruction.form.addProperty'),
      propertyKey: t('automations.instruction.form.propertyKey'),
      propertyValue: t('automations.instruction.form.propertyValue'),
      removeItem: t('automations.instruction.form.removeItem'),
      removeProperty: t('automations.instruction.form.removeProperty'),
      uploadLabel: t('automations.instruction.form.uploadLabel'),
      uploadRemove: t('automations.instruction.form.uploadRemove'),
    }),
    [t]
  );

  const uploadFile = useCallback(
    async (file: string) => {
      if (!workspaceId) return file;
      const [{ url }] = (await api.uploadFiles(file, workspaceId)) || [{}];

      return url;
    },
    [workspaceId]
  );

  const items = useMemo(() => {
    const items: TabsProps['items'] = [];
    if (schema !== null) {
      items.push({
        label: <div className="px-2">{t('pages.blocks.settings.schema')}</div>,
        key: 'config',
        children: schema ? (
          <SchemaForm
            schema={schema}
            onChange={setConfigBlock}
            initialValues={config}
            buttons={[]}
            locales={locales}
            utils={{ extractSelectOptions, uploadFile }}
            components={components}
          />
        ) : (
          <Loading />
        ),
      });
    }
    items.push({
      label: <div className="px-2">{t('pages.blocks.settings.generic')}</div>,
      key: 'advanced',
      children: (
        <SchemaForm
          schema={commonSchema}
          onChange={setConfigAdvanced}
          initialValues={config}
          buttons={[]}
          locales={locales}
          utils={{ extractSelectOptions, uploadFile }}
        />
      ),
    });
    return items;
  }, [
    commonSchema,
    config,
    extractSelectOptions,
    locales,
    schema,
    t,
    uploadFile,
  ]);

  return (
    <div className="pr-panel-settings flex flex-1 flex-col">
      <Tabs className="flex flex-1" items={items} />
      <button
        onClick={removeBlock}
        className="border-t border-light-gray !text-pr-orange h-[4rem] font-bold text-left p-4"
      >
        {t('pages.blocks.remove')}
      </button>
    </div>
  );
};

export default Settings;
