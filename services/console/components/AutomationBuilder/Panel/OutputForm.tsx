import { FC, useMemo } from 'react';
import { Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import SchemaForm from '../../SchemaForm/SchemaForm';

interface OutputFormProps {
  output?: string;
  onChange: (v: { output: any }) => void;
}

const buttons: any[] = [];

export const OutputForm: FC<OutputFormProps> = ({ output, onChange }) => {
  const { t } = useTranslation('workspaces');

  const schema: Schema = useMemo(
    () => ({
      additionalProperties: true,
      title: t('automations.output.edit.title'),
      description: t('automations.output.edit.description', {
        interpolation: {
          skipOnVariables: true,
        },
      }),
    }),
    [t]
  );

  return (
    <div className="flex flex-1 flex-col h-full overflow-x-auto">
      <SchemaForm
        schema={schema}
        onChange={onChange}
        initialValues={output}
        buttons={buttons}
      />
    </div>
  );
};

export default OutputForm;
