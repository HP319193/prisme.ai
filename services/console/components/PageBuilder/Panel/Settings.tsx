import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Schema,
  SchemaForm,
  useBlock,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useWorkspace } from '../../../layouts/WorkspaceLayout';
import useLocalizedText from '../../../utils/useLocalizedText';
import usePages from '../../PagesProvider/context';
import useSchema from '../../SchemaForm/useSchema';
import { usePageBuilder } from '../context';

const noop = () => null;

interface SettingsProps {
  removeBlock: () => void;
  schema?: Schema;
}

export const Settings = ({ removeBlock, schema }: SettingsProps) => {
  const { t } = useTranslation('workspaces');
  const { page } = usePageBuilder();
  const {
    workspace: { id: workspaceId, automations },
  } = useWorkspace();
  const { pages } = usePages();

  const { extractSelectOptions } = useSchema({
    pageSections: page.blocks.flatMap(({ config: { sectionId } = {} }) =>
      sectionId ? sectionId : []
    ),
    automations,
    pages: pages.get(workspaceId),
  });
  const { localizeSchemaForm } = useLocalizedText();
  const { config = {}, setConfig = noop } = useBlock();

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

  const collapseItems = useMemo(() => {
    let collapseItems = [
      {
        label: t('pages.blocks.settings.generic'),
        content: (
          <SchemaForm
            schema={commonSchema}
            onChange={setConfig}
            initialValues={config}
            buttons={[]}
            locales={locales}
            utils={{ extractSelectOptions }}
          />
        ),
      },
    ];

    if (schema) {
      collapseItems = [
        {
          label: t('pages.blocks.settings.schema'),
          content: (
            <SchemaForm
              schema={schema}
              onChange={setConfig}
              initialValues={config}
              buttons={[]}
              utils={{ extractSelectOptions }}
            />
          ),
        },
        ...collapseItems,
      ];
    }

    return collapseItems;
  }, [
    commonSchema,
    config,
    extractSelectOptions,
    locales,
    schema,
    setConfig,
    t,
  ]);

  return (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto overflow-x-hidden">
      <div>
        <Collapse items={collapseItems} defaultActiveKey={0} />
      </div>
      <div>
        <Button onClick={removeBlock} className="!text-pr-orange">
          <DeleteOutlined /> {t('pages.blocks.remove')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
