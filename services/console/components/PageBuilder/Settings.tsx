import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Divider,
  Tooltip,
  useBlock,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import Form from '../SchemaForm/Form';
import { Schema } from '../SchemaForm/types';

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
        layout: 'columns',
        lines: [['onInit', 'updateOn']],
      },
    }),
    [t]
  );
  return (
    <div className="flex flex-1 flex-col bg-slate-100 p-4 shadow-inner shadow-slate-500 -mx-2 px-6">
      <Form schema={commonSchema} onChange={setConfig} initialValues={config} />
      <Divider />
      {SetupComponent && (
        <>
          {SetupComponent}
          <Divider />
        </>
      )}
      {schema && (
        <>
          <Form onChange={setConfig} schema={schema} initialValues={config} />
          <Divider />
        </>
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
