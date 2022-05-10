import { FC, useCallback, useMemo, useState } from 'react';
import Fieldset from '../../../layouts/Fieldset';
import { useTranslation } from 'next-i18next';
import {
  FieldProps,
  getSchemaFormLabel,
  SchemaForm,
  SchemaFormDescription,
} from '@prisme.ai/design-system';
import { CodeEditorInline } from '../../CodeEditor/lazy';
import { useField } from 'react-final-form';
import FieldContainerWithRaw from '../../FieldContainerWithRaw';
import useSchema, {
  EnhancedSchema,
  isUiOptionsPath,
} from '../../SchemaForm/useSchema';
import { useWorkspace } from '../../../layouts/WorkspaceLayout';
import { readAppConfig } from './readAppConfig';

interface InstructionValueProps {
  instruction: string;
  value: any;
  schema?: any;
  onChange: (values: any) => void;
}

const EmptyButtons: any[] = [];
const FieldAny = ({ schema, name, label }: FieldProps) => {
  const field = useField(name);
  const [value, setValue] = useState(
    typeof field.input.value === 'string'
      ? field.input.value
      : JSON.stringify(field.input.value, null, '  ')
  );
  const onChange = useCallback(
    (value: string) => {
      setValue(value);
      try {
        const json = JSON.parse(value);
        field.input.onChange(json);
      } catch {
        field.input.onChange(value);
      }
    },
    [field.input]
  );

  return (
    <div className="flex flex-1 flex-col my-2">
      <SchemaFormDescription text={schema.description}>
        <label className="text-[10px] text-gray">
          {label || schema.title || getSchemaFormLabel(name)}
        </label>
        <CodeEditorInline
          value={value}
          onChange={onChange}
          mode="json"
          style={{ flex: 'auto' }}
        />
      </SchemaFormDescription>
    </div>
  );
};

const components = {
  FieldAny,
  FieldContainer: FieldContainerWithRaw,
};

export const InstructionValue: FC<InstructionValueProps> = ({
  instruction,
  value,
  schema = {},
  onChange,
}) => {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { makeSchema } = useSchema();
  const appInstance = useMemo(() => {
    if (!workspace.imports) return null;
    const [appName] = instruction.split(/\./);
    if (!workspace.imports[appName]) return null;
    return workspace.imports[appName].config || null;
  }, [instruction, workspace.imports]);

  const cleanedSchema = useMemo(() => {
    const cleaned = {
      ...schema,
      title: t('automations.instruction.description', {
        context: instruction,
        default: schema.description,
      }),
    };
    if (instruction === 'repeat') {
      cleaned['ui:options'] = {
        oneOf: {
          options: [
            {
              label: 'automations.instruction.form.repeat.on.label',
              index: 0,
              value: {
                until: undefined,
              },
            },
            {
              label: 'automations.instruction.form.repeat.until.label',
              index: 1,
              value: {
                on: undefined,
              },
            },
          ],
        },
      };
    }
    return makeSchema(cleaned, {
      'select:config': (schema) => {
        if (!isUiOptionsPath(schema['ui:options'])) return schema;
        const { path } = schema['ui:options'];
        if (!path) return schema;
        const values: string[] = readAppConfig(appInstance, path);
        schema['ui:widget'] = 'select';
        schema['ui:options'] = {
          select: {
            options: values.map((value) => ({
              label: value,
              value,
            })),
          },
        };
        return schema;
      },
    });
  }, [instruction, makeSchema, schema, t]);

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
    <Fieldset
      legend={t('automations.instruction.label', { context: instruction })}
      hasDivider={false}
    >
      <SchemaForm
        schema={cleanedSchema}
        onChange={onChange}
        initialValues={value}
        buttons={EmptyButtons}
        components={components}
        locales={locales}
      />
    </Fieldset>
  );
};

export default InstructionValue;
