import { Loading, Schema, SchemaForm } from '@prisme.ai/design-system';
import { Tabs, TabsProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import useLocalizedText from '../../../utils/useLocalizedText';
import useSchema from '../../SchemaForm/useSchema';
import { usePageBuilder } from '../context';
import useBlockPageConfig from '../useBlockPageConfig';
import { useWorkspace } from '../../../providers/Workspace';
import components from '../../SchemaForm/schemaFormComponents';

interface SettingsProps {
  removeBlock: () => void;
  schema?: Schema | null;
  blockId: string;
}

export const Settings = ({ removeBlock, schema, blockId }: SettingsProps) => {
  const { t } = useTranslation('workspaces');
  const { value } = usePageBuilder();
  const {
    workspace: { automations, pages },
  } = useWorkspace();
  const { config, onConfigUpdate } = useBlockPageConfig({
    blockId,
  });

  const mergeConfig = useCallback(
    (newConfig: Record<string, any>) =>
      onConfigUpdate({ ...config, ...newConfig }),
    [config, onConfigUpdate]
  );

  const debouncedMergeConfig = useMemo(
    () =>
      debounce((newConfig: Record<string, any>) => {
        mergeConfig(newConfig);
      }, 500),
    [mergeConfig]
  );

  const { extractSelectOptions } = useSchema({
    pageSections: Array.from(
      value.values()
    ).flatMap(({ config: { sectionId } = {} }) => (sectionId ? sectionId : [])),
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

  const items = useMemo(() => {
    const items: TabsProps['items'] = [];
    if (schema !== null) {
      items.push({
        label: <div className="px-2">{t('pages.blocks.settings.schema')}</div>,
        key: 'config',
        children: schema ? (
          <SchemaForm
            schema={schema}
            onChange={debouncedMergeConfig}
            initialValues={config}
            buttons={[]}
            locales={locales}
            utils={{ extractSelectOptions }}
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
          onChange={debouncedMergeConfig}
          initialValues={config}
          buttons={[]}
          locales={locales}
          utils={{ extractSelectOptions }}
        />
      ),
    });
    return items;
  }, [
    commonSchema,
    config,
    debouncedMergeConfig,
    extractSelectOptions,
    locales,
    schema,
    t,
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
