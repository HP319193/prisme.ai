import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import Fieldset from '../../../layouts/Fieldset';
import FieldContainer from '../../../layouts/Field';
import { Button } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { CodeEditorInline } from '../../CodeEditor/lazy';

interface OutputFormProps {
  output?: string;
  onSubmit: (v: { output: any }) => void;
}

export const OutputForm: FC<OutputFormProps> = ({ output, onSubmit }) => {
  const submit = useCallback(
    ({ output }: { output: string }) => {
      try {
        if (typeof output === 'object') {
          throw new Error('not json');
        }
        const parsedValue = JSON.parse(output.replace('\n', ''));
        onSubmit({ output: parsedValue });
      } catch (e) {
        onSubmit({ output });
      }
    },
    [onSubmit]
  );

  const { t } = useTranslation('workspaces');
  return (
    <div className="flex flex-1 flex-col h-full">
      <Form onSubmit={submit} initialValues={{ output }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset legend={t('automations.output.edit.title')}>
              <FieldContainer
                name="output"
                label={t('automations.output.edit.label')}
              >
                {({ input }) => (
                  <div>
                    <CodeEditorInline
                      mode="json"
                      value={input.value}
                      onChange={input.onChange}
                    />
                  </div>
                )}
              </FieldContainer>
            </Fieldset>

            <Button type="submit">{t('automations.output.edit.save')}</Button>
          </form>
        )}
      </Form>
    </div>
  );
};

export default OutputForm;
