import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  useBlock,
  SchemaForm,
  Schema,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

const noop = () => null;

interface SettingsProps {
  removeBlock: () => void;
  schema?: Schema;
}

export const Settings = ({ removeBlock, schema }: SettingsProps) => {
  const { t } = useTranslation('workspaces');
  const {
    setupComponent: SetupComponent,
    config = {},
    setConfig = noop,
  } = useBlock();
  const commonSchema: Schema = useMemo(
    () => ({
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
      },
      'ui:options': {
        grid: [[['onInit', 'updateOn']]],
      },
    }),
    [t]
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

  return (
    <div className="flex flex-1 flex-col p-4 shadow-inner shadow-slate-500 -mx-2 px-6">
      <SchemaForm
        schema={commonSchema}
        onChange={setConfig}
        initialValues={config}
        buttons={[]}
        locales={locales}
      />
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
