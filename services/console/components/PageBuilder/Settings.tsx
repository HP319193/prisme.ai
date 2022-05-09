import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  useBlock,
  SchemaForm,
  Schema,
  Collapse,
  UiOptionsSelect,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useSchema, { EnhancedSchema } from '../SchemaForm/useSchema';

const noop = () => null;

interface SettingsProps {
  removeBlock: () => void;
  schema?: Schema;
}

export const Settings = ({ removeBlock, schema }: SettingsProps) => {
  const { t } = useTranslation('workspaces');
  const { makeSchema } = useSchema();
  const {
    setupComponent: SetupComponent,
    config = {},
    setConfig = noop,
  } = useBlock();
  const {
    workspace: { automations = {} },
  } = useWorkspace();

  const commonSchema: Schema = useMemo(
    () =>
      makeSchema({
        type: 'object',
        properties: {
          onInit: {
            type: 'string',
            title: t('pages.blocks.settings.onInit.label'),
            description: t('pages.blocks.settings.onInit.description'),
          },
          updateOn: {
            type: 'string',
            title: t('pages.blocks.settings.updateOn.label'),
            description: t('pages.blocks.settings.updateOn.description'),
          },
          automation: {
            type: 'string',
            title: t('pages.blocks.settings.automation.label'),
            description: t('pages.blocks.settings.automation.description'),
            'ui:widget': 'select:endpoints',
          },
          sectionId: {
            type: 'string',
            title: t('pages.blocks.settings.sectionId.label'),
            description: t('pages.blocks.settings.sectionId.description'),
          },
        },
      }),
    [makeSchema, t]
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

  const collapseItems = useMemo(
    () => [
      {
        label: t('pages.blocks.settings.advanced'),
        content: (
          <SchemaForm
            schema={commonSchema}
            onChange={setConfig}
            initialValues={config}
            buttons={[]}
            locales={locales}
          />
        ),
      },
    ],
    [commonSchema, config, locales, setConfig, t]
  );

  return (
    <div className="flex flex-1 flex-col p-4 shadow-inner shadow-slate-500 -mx-2 px-6">
      <Collapse items={collapseItems} />
      <Divider />
      {SetupComponent && (
        <>
          {SetupComponent}
          <Divider />
        </>
      )}
      {schema && (
        <div className="bg-white">
          <SchemaForm
            schema={schema}
            onChange={setConfig}
            initialValues={config}
            buttons={[]}
          />
          <Divider />
        </div>
      )}
      <div>
        <Button onClick={removeBlock}>
          <DeleteOutlined /> {t('pages.blocks.remove')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
