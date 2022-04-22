import { FC, useCallback, useMemo } from 'react';
import { Schema, SchemaForm } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { CodeEditorInline } from '../../CodeEditor/lazy';

interface OutputFormProps {
  output?: string;
  onChange: (v: { output: any }) => void;
}

const components = {
  JSONEditor: (props: any) => <CodeEditorInline mode="json" {...props} />,
};

const buttons: any[] = [];

export const OutputForm: FC<OutputFormProps> = ({ output, onChange }) => {
  const { t } = useTranslation('workspaces');

  const schema: Schema = useMemo(
    () => ({
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
        components={components}
        buttons={buttons}
      />
    </div>
  );
};

export default OutputForm;
