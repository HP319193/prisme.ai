import { FC, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Schema, SchemaForm } from '@prisme.ai/design-system';
import useSchema from '../../SchemaForm/useSchema';
import { useAutomationBuilder } from '../context';
import useLocalizedText from '../../../utils/useLocalizedText';
import components from '../../SchemaForm/schemaFormComponents';
import { useWorkspace } from '../../../providers/Workspace';

interface InstructionValueProps {
  instruction: string;
  value: any;
  schema?: any;
  onChange: (values: any) => void;
}

const EmptyButtons: any[] = [];

export const InstructionValue: FC<InstructionValueProps> = ({
  instruction,
  value,
  schema = {},
  onChange,
}) => {
  const { workspace } = useWorkspace();
  const { automationId } = useAutomationBuilder();
  const { t } = useTranslation('workspaces');
  const { localizeSchemaForm, localize } = useLocalizedText();

  const { config: appInstance, appName } = useMemo(() => {
    if (!workspace.imports) return { config: workspace.config };
    const [appName] = instruction.split(/\./);
    if (!workspace.imports[appName]) return { config: workspace.config };
    return { config: {}, appName };
  }, [instruction, workspace.config, workspace.imports]);

  const { extractSelectOptions, extractAutocompleteOptions } = useSchema({
    config: appInstance,
    automations: Object.keys(workspace.automations || {}).reduce(
      (prev, key) =>
        key === automationId
          ? prev
          : { ...prev, [key]: (workspace.automations || {})[key] },
      {}
    ),
    pages: workspace.pages,
    apps: workspace.imports,
    workspace,
  });

  const cleanedSchema = useMemo<Schema>(() => {
    const cleaned = {
      ...localizeSchemaForm(schema),
      title: t('automations.instruction.label', {
        context:
          appName && localize(schema.name)
            ? `${localize(schema.name)} (${appName})`
            : instruction,
      }),
      description: t('automations.instruction.description', {
        context: instruction,
        default: schema.description,
      }),
    };
    if (instruction === 'repeat') {
      cleaned['ui:options'] = {
        oneOf: {
          options: [
            {
              label: t('automations.instruction.form.repeat.on.label'),
              index: 0,
              value: {
                until: undefined,
              },
            },
            {
              label: t('automations.instruction.form.repeat.until.label'),
              index: 1,
              value: {
                on: undefined,
              },
            },
          ],
        },
      };
    }
    if (instruction === 'emit') {
      cleaned.properties = cleaned.properties || {};
      cleaned.properties.event = cleaned.properties.event || {};
      cleaned.properties.event['ui:widget'] = 'autocomplete';
      cleaned.properties.event['ui:options'] = {
        autocomplete: 'events:listen',
      };
    }
    return cleaned;
  }, [instruction, localizeSchemaForm, localize, appName, schema, t]);

  const locales = useMemo(
    () => ({
      addItem: t('automations.instruction.form.addItem'),
      addProperty: t('automations.instruction.form.addProperty'),
      propertyKey: t('automations.instruction.form.propertyKey'),
      propertyValue: t('automations.instruction.form.propertyValue'),
      removeItem: t('automations.instruction.form.removeItem'),
      removeProperty: t('automations.instruction.form.removeProperty'),
      uploadLabel: t('automations.instruction.form.uploadLabel'),
      uploadRemove: t('automations.instruction.form.uploadRemove'),
    }),
    [t]
  );

  if (!schema) return null;

  return (
    <SchemaForm
      schema={cleanedSchema}
      onChange={onChange}
      initialValues={value}
      buttons={EmptyButtons}
      components={components}
      locales={locales}
      utils={{ extractSelectOptions, extractAutocompleteOptions }}
    />
  );
};

export default InstructionValue;
