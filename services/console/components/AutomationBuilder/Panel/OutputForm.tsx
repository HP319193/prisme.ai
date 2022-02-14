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
  const submitAsJSON = useCallback(
    ({ output }: { output: string }) => {
      try {
        const parsedValue = JSON.parse(output.replace('\n', ''));
        onSubmit({ output: parsedValue });
      } catch (e: any) {
        console.error('error parsing output value :', output);
        console.error(e);
      }
    },
    [onSubmit]
  );

  const { t } = useTranslation('workspaces');
  return (
    <div className="flex flex-1 flex-col h-full">
      <Form onSubmit={submitAsJSON} initialValues={{ output }}>
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
