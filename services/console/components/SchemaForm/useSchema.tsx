import { Schema, UiOptionsSelect } from '@prisme.ai/design-system';
import { useCallback } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';

type SelectDataSource = 'select:automations' | 'select:endpoints';

export interface EnhancedSchema
  extends Omit<
    Schema,
    'ui:widget' | 'properties' | 'additionalProperties' | 'items' | 'oneOf'
  > {
  'ui:widget'?: Schema['ui:widget'] | SelectDataSource;
  properties?: Record<string, EnhancedSchema>;
  additionalProperties?: boolean | EnhancedSchema;
  items?: EnhancedSchema;
  oneOf?: EnhancedSchema[];
}

export const useSchema = () => {
  const {
    workspace: { automations = {} },
  } = useWorkspace();

  const makeSchema = useCallback(
    (schema: EnhancedSchema) => {
      const parseSchema = (schema: EnhancedSchema): Schema => {
        const fixedSchema = { ...schema };

        if (fixedSchema.properties) {
          const { properties } = fixedSchema;
          fixedSchema.properties = Object.keys(properties).reduce(
            (prev, key) => ({
              ...prev,
              [key]: parseSchema(properties[key]),
            }),
            {}
          );
        }

        if (
          fixedSchema.additionalProperties &&
          typeof fixedSchema.additionalProperties === 'object'
        ) {
          fixedSchema.additionalProperties = parseSchema(
            fixedSchema.additionalProperties
          );
        }

        if (fixedSchema.items) {
          fixedSchema.items = parseSchema(fixedSchema.items);
        }

        if (fixedSchema.oneOf) {
          fixedSchema.oneOf = fixedSchema.oneOf.map((one) => parseSchema(one));
        }

        const widget = fixedSchema['ui:widget'];
        switch (widget) {
          case 'select:automations':
          case 'select:endpoints':
            fixedSchema['ui:widget'] = 'select';
            fixedSchema['ui:options'] = {
              select: {
                options: Object.keys(automations).flatMap((key) => {
                  const { slug = key, name, description, when } = automations[
                    key
                  ];

                  if (
                    widget === 'select:endpoints' &&
                    (!when || !when.endpoint)
                  ) {
                    return [];
                  }
                  return {
                    label: (
                      <div className="flex flex-col">
                        <div>{name}</div>
                        <div className="text-neutral-500 text-xs">
                          {description}
                        </div>
                      </div>
                    ),
                    value: slug,
                  };
                }),
              },
            };
        }

        return fixedSchema as Schema;
      };

      return parseSchema(schema);
    },
    [automations]
  );

  return { makeSchema };
};

export default useSchema;
