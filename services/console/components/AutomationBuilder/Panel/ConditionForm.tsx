import { useTranslation } from 'next-i18next';
import { Button } from '@prisme.ai/design-system';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import Fieldset from '../../../layouts/Fieldset';
import { Field } from '../../SchemaForm/Field';
import { PlusOutlined } from '@ant-design/icons';

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
            <Fieldset
              legend={t('automations.condition.edit.title')}
              hasDivider={false}
            >
              <>
                <Field field="condition" type="string" required />
                <Button type="submit">
                  <PlusOutlined />
                  {t('automations.condition.edit.save')}
                </Button>
              </>
            </Fieldset>
          </form>
        )}
      </Form>
    </div>
  );
};

export default ConditionForm;
