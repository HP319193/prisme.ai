import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import { Schema, SchemaForm } from '@prisme.ai/design-system';

interface TriggerFormProps {
  trigger?: Prismeai.When;
  onChange: (v: Prismeai.When) => void;
}

const buttons: any[] = [];

export const TriggerForm: FC<TriggerFormProps> = ({ trigger, onChange }) => {
  const { t } = useTranslation('workspaces');
  const initialValue = useMemo(
    () => ({
      events: trigger?.events || [],
      endpoint: trigger?.endpoint ?? false,
    }),
    [trigger]
  );
  const schema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        events: {
          type: 'array',
          title: t('automations.trigger.events.title'),
          description: t('automations.trigger.events.help'),
          items: {
            type: 'string',
            title: t('automations.trigger.events.item'),
          },
        },
        // dates: {
        //   title: t('automations.trigger.dates.title'),
        //   description: t('automations.trigger.dates.help'),
        // },
        endpoint: {
          type: 'boolean',
          title: t('automations.trigger.endpoint.custom'),
          description: t('automations.trigger.endpoint.help'),
        },
      },
    }),
    [t]
  );

  return (
    <div className="overflow-x-auto">
      <SchemaForm
        schema={schema}
        initialValues={initialValue}
        onChange={onChange}
        locales={{
          addItem: t('automations.trigger.events.add'),
        }}
        buttons={buttons}
      />
    </div>
  );
};

export default TriggerForm;
