import { Schema } from '@prisme.ai/design-system';
import { useCallback } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { readAppConfig } from '../AutomationBuilder/Panel/readAppConfig';

export const useSchema = (store: Record<string, any> = {}) => {
  const { localize } = useLocalizedText();
  const extractSelectOptions = useCallback(
    (schema: Schema) => {
      const { 'ui:options': uiOptions = {} } = schema;

      switch (uiOptions.from) {
        case 'config':
          const { path = '' } = uiOptions;
          if (!path) return null;
          const values: string[] = readAppConfig(store.config, path);
          return values.map((value) => ({
            label: value,
            value,
          }));
        case 'pageSections':
          return (store.pageSections || []).map((sectionId: string) => ({
            label: sectionId,
            value: sectionId,
          }));
        case 'automations':
          if (!store.automations) return [];
          return Object.keys(store.automations).flatMap((key) => {
            const { slug = key, name, description, when } = store.automations[
              key
            ];

            if (uiOptions.filter === 'endpoint' && (!when || !when.endpoint)) {
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
          });
        case 'pages':
          if (!store.pages) return null;
          return Array.from<Prismeai.Page>(store.pages).flatMap((page) => {
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
          });
      }
      return null;
    },
    [localize, store.automations, store.config, store.pageSections, store.pages]
  );

  return { extractSelectOptions };
};

export default useSchema;
