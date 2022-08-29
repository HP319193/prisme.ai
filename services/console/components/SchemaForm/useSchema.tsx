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
          return [
            {
              label: '',
              value: '',
            },
            ...values.map((value) => ({
              label: value,
              value,
            })),
          ];
        case 'pageSections':
          return [
            {
              label: '',
              value: '',
            },
            ...(store.pageSections || []).map((sectionId: string) => ({
              label: sectionId,
              value: sectionId,
            })),
          ];
        case 'automations':
          if (!store.automations) return [];
          return [
            {
              label: '',
              value: '',
            },
            ...Object.keys(store.automations).flatMap((key) => {
              const { slug = key, name, description, when } = store.automations[
                key
              ];

              if (
                uiOptions.filter === 'endpoint' &&
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
          ];
        case 'pages':
          if (!store.pages) return null;
          return [
            {
              label: '',
              value: '',
            },
            ...Array.from<Prismeai.Page>(store.pages).flatMap((page) => {
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
            }),
          ];
      }
      return null;
    },
    [localize, store.automations, store.config, store.pageSections, store.pages]
  );

  const extractAutocompleteOptions = useCallback(
    (schema: Schema) => {
      const { ['ui:options']: uiOptions = {} } = schema;

      switch (uiOptions.autocomplete) {
        case 'events:emit': {
          const apps: Prismeai.AppDetails[] = store.apps || [];
          const automations = store.workspace?.automations || {};
          const when: string[] = Object.keys(automations)
            .flatMap((key) => {
              const { events } = (automations[key] || {}).when;
              return events || [];
            }, [])
            .filter(Boolean);

          return [
            ...(when.length > 0
              ? [
                  {
                    label: store.workspace.name,
                    options: when.map((event) => ({
                      label: event,
                      value: event,
                    })),
                  },
                ]
              : []),
            ...apps.map(({ appName, events: { listen } = {} }) => ({
              label: appName,
              options: (listen || []).map((event) => ({
                label: event,
                value: event,
              })),
            })),
          ];
        }
      }

      return [];
    },
    [store.apps, store.workspace]
  );

  return { extractSelectOptions, extractAutocompleteOptions };
};

export default useSchema;
