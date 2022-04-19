import { useTranslation } from 'next-i18next';
import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { FC, useCallback, useMemo } from 'react';
import Fieldset from '../../../layouts/Fieldset';
import { Field } from '../../SchemaForm/Field';
import { PlusOutlined } from '@ant-design/icons';

interface ConditionFormProps {
  condition?: string;
  onChange: (c: string) => void;
}

const EmptyArray: any[] = [];

export const ConditionForm: FC<ConditionFormProps> = ({
  condition,
  onChange,
}) => {
  const { t } = useTranslation('workspaces');
  const handleChange = useCallback(
    (condition) => {
      onChange(condition);
    },
    [onChange]
  );
  const schema: Schema = useMemo(
    () => ({
      type: 'string',
      title: t('automations.condition.edit.title'),
      description: t('automations.condition.edit.description'),
    }),
    [t]
  );

  return (
    <SchemaForm
      schema={schema}
      onChange={handleChange}
      initialValues={condition}
      buttons={EmptyArray}
    />
  );
};

export default ConditionForm;
