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
  removeWidget: () => void;
  schema?: Schema;
}

export const Settings = ({ removeWidget, schema }: SettingsProps) => {
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
          title: t('pages.widgets.settings.onInit.label'),
          description: t('pages.widgets.settings.onInit.description'),
        },
        updateOn: {
          type: 'string',
          title: t('pages.widgets.settings.updateOn.label'),
          description: t('pages.widgets.settings.updateOn.description'),
        },
      },
      'ui:options': {
        grid: [[['onInit', 'updateOn']]],
      },
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
        <Button onClick={removeWidget}>
          <DeleteOutlined /> {t('pages.widgets.remove')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
