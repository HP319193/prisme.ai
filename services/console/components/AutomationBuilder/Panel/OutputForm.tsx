import { FC } from 'react';
import { Form } from 'react-final-form';
import Fieldset from '../../../layouts/Fieldset';
import FieldContainer from '../../../layouts/Field';
import { Button } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { CodeEditorInline } from '../../CodeEditor/lazy';

interface OutputFormProps {
  output?: string;
  onSubmit: (v: string) => void;
}

export const OutputForm: FC<OutputFormProps> = ({ output, onSubmit }) => {
  const { t } = useTranslation('workspaces');
  return (
    <div className="flex flex-1 flex-col h-full">
      <Form onSubmit={onSubmit} initialValues={{ output }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset legend={t('automations.output.edit.title')}>
              <FieldContainer
                name="output"
                label={t('automations.output.edit.label')}
              >
                {({ input }) => (
                  <CodeEditorInline
                    mode="json"
                    value={input.value}
                    onChange={input.onChange}
                  />
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
