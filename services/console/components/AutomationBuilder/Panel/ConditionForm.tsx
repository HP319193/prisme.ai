import { useTranslation } from 'next-i18next';
import { Button } from 'primereact/button';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import Fieldset from '../../../layouts/Fieldset';
import { Field } from '../../SchemaForm/Field';

interface ConditionFormProps {
  condition?: string;
  onSubmit: (c: string) => void;
}

export const ConditionForm: FC<ConditionFormProps> = ({
  condition,
  onSubmit,
}) => {
  const { t } = useTranslation('workspaces');
  const submit = useCallback(
    (values) => {
      onSubmit(values.condition);
    },
    [onSubmit]
  );

  return (
    <div>
      <Form onSubmit={submit} initialValues={{ condition }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset legend={t('automations.condition.edit.title')}>
              <Field field="condition" type="string" required />
              <Button type="submit">
                {t('automations.condition.edit.submit')}
              </Button>
            </Fieldset>
          </form>
        )}
      </Form>
    </div>
  );
};

export default ConditionForm;
