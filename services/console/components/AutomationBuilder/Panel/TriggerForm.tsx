import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import { FieldProps, Schema } from '@prisme.ai/design-system';
import useSchema from '../../SchemaForm/useSchema';
import { useAutomationBuilder } from '../context';
import { useWorkspace } from '../../../providers/Workspace';
import dynamic from 'next/dynamic';
import SchemaForm from '../../SchemaForm/SchemaForm';

const Schedule = dynamic(() => import('./Schedule'), {
  ssr: false,
});
const ScheduleWidget = (props: FieldProps) => {
  return <Schedule {...props} />;
};

interface TriggerFormProps {
  trigger?: Prismeai.When;
  onChange: (v: Prismeai.When) => void;
}

const buttons: any[] = [];

export const TriggerForm: FC<TriggerFormProps> = ({ trigger, onChange }) => {
  const { t } = useTranslation('workspaces');

  const { workspace } = useWorkspace();
  const { automationId } = useAutomationBuilder();
  const { extractAutocompleteOptions } = useSchema({
    config: workspace.config,
    apps: workspace.imports,
    automations: Object.keys(workspace.automations || {}).reduce(
      (prev, key) =>
        key === automationId
          ? prev
          : {
              ...prev,
              [key]: (workspace.automations || {})[key],
            },
      {}
    ),
    workspace,
    pages: workspace.pages,
  });

  const initialValue = useMemo(
    () => ({
      events: trigger?.events || [],
      endpoint: trigger?.endpoint ?? false,
      schedules: trigger?.schedules ?? [],
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
            'ui:widget': 'autocomplete',
            'ui:options': {
              autocomplete: 'events:emit',
            },
          },
        },
        schedules: {
          type: 'array',
          title: t('automations.trigger.schedules.title'),
          description: t('automations.trigger.schedules.help'),
          items: {
            type: 'string',
            'ui:widget': ScheduleWidget,
          },
        },
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
    <div className="overflow-x-auto mx-4">
      <SchemaForm
        schema={schema}
        initialValues={initialValue}
        onChange={onChange}
        locales={{
          addItem: t('automations.trigger.events.add'),
        }}
        buttons={buttons}
        utils={{ extractAutocompleteOptions }}
      />
    </div>
  );
};

export default TriggerForm;
