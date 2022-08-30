import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import { Schema, SchemaForm } from '@prisme.ai/design-system';
import useSchema from '../../SchemaForm/useSchema';
import { useWorkspace } from '../../WorkspaceProvider';
import { useApps } from '../../AppsProvider';

interface TriggerFormProps {
  trigger?: Prismeai.When;
  onChange: (v: Prismeai.When) => void;
}

const buttons: any[] = [];

export const TriggerForm: FC<TriggerFormProps> = ({ trigger, onChange }) => {
  const { t } = useTranslation('workspaces');

  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const { extractAutocompleteOptions } = useSchema({
    config: workspace.config,
    apps: appInstances.get(workspace.id),
    workspace,
  });

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
            'ui:widget': 'autocomplete',
            'ui:options': {
              autocomplete: 'events:emit',
            },
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
        utils={{ extractAutocompleteOptions }}
      />
    </div>
  );
};

export default TriggerForm;
