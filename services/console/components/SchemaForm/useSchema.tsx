import { Schema, UiOptionsSelect } from '@prisme.ai/design-system';
import { useCallback } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useLocalizedText from '../../utils/useLocalizedText';
import usePages from '../PagesProvider/context';

type SelectDataSource =
  | 'select:automations'
  | 'select:endpoints'
  | 'select:pages';

export interface EnhancedSchema
  extends Omit<
    Schema,
    'ui:widget' | 'properties' | 'additionalProperties' | 'items' | 'oneOf'
  > {
  'ui:widget'?: Schema['ui:widget'] | SelectDataSource | string;
  properties?: Record<string, EnhancedSchema>;
  additionalProperties?: boolean | EnhancedSchema;
  items?: EnhancedSchema;
  oneOf?: EnhancedSchema[];
}

type CustomSources = Record<string, (schema: EnhancedSchema) => EnhancedSchema>;

export const useSchema = () => {
  const {
    workspace: { id: workspaceId, automations = {} },
  } = useWorkspace();
  const { localize } = useLocalizedText();
  const { pages } = usePages();

  const makeSchema = useCallback(
    (schema: EnhancedSchema, customSources?: CustomSources) => {
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

        if (typeof widget !== 'string') return fixedSchema as Schema;

        if (customSources && customSources[widget]) {
          return customSources[widget](fixedSchema) as Schema;
        }
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
                        <div>{localize(name) || slug}</div>
                        <div className="text-neutral-500 text-xs">
                          {localize(description)}
                        </div>
                      </div>
                    ),
                    value: slug,
                  };
                }),
              },
            };
            break;
          case 'select:pages':
            fixedSchema['ui:widget'] = 'select';
            fixedSchema['ui:options'] = {
              select: {
                options: Array.from(pages.get(workspaceId) || []).flatMap(
                  (page) => {
                    const { id, slug, name = slug, description } = page;
                    return {
                      label: (
                        <div className="flex flex-col">
                          <div>{localize(name)}</div>
                          <div className="text-neutral-500 text-xs">
                            {localize(description)}
                          </div>
                        </div>
                      ),
                      value: id,
                    };
                  }
                ),
              },
            };
            break;
        }

        return fixedSchema as Schema;
      };

      return parseSchema(schema);
    },
    [automations, localize, pages, workspaceId]
  );

  return { makeSchema };
};

export default useSchema;
