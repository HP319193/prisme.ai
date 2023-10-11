import { useTranslation } from 'next-i18next';
import { Schema } from '@prisme.ai/design-system';
import { FC, useCallback, useMemo } from 'react';
import SchemaForm from '../../SchemaForm/SchemaForm';

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
      'ui:widget': 'textarea',
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
