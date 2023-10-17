import { Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';
import useLocalizedText from '../../utils/useLocalizedText';
import { readAppConfig } from '../AutomationBuilder/Panel/readAppConfig';

export const useSchema = (store: Record<string, any> = {}) => {
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const {
    workspace: {
      id,
      name: workspaceName,
      config: { value: config } = {},
      automations = {},
      pages = {},
      imports = {},
    },
  } = useWorkspace();

  const extractSelectOptions = useCallback(
    (schema: Schema) => {
      const { 'ui:options': uiOptions = {} } = schema;

      switch (uiOptions.from) {
        case 'config':
          const { path = '' } = uiOptions;
          if (!path) return null;
          const values: string[] = readAppConfig(config, path) || [];
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
          if (!automations) return [];
          return [
            {
              label: '',
              value: '',
            },
            ...Object.entries(automations).flatMap(
              ([key, { slug = key, name, description, when }]) => {
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
              }
            ),
          ];
        case 'pages':
          if (!pages) return null;
          return [
            {
              label: '',
              value: '',
            },
            ...Object.entries(pages).flatMap(
              ([slug, { id, name = slug, description }]) => {
                return {
                  label: (
                    <div
                      className={`flex flex-col ${
                        !slug ? 'text-neutral-200' : ''
                      }`}
                    >
                      <div>{localize(name)}</div>
                      <div className="text-neutral-500 text-xs">
                        {localize(description)}
                      </div>
                    </div>
                  ),
                  value: slug ? `/${slug}` : id,
                };
              }
            ),
          ];
      }
      return null;
    },
    [automations, config, localize, pages, store.pageSections]
  );

  const extractAutocompleteOptions = useCallback(
    (schema: Schema) => {
      const { ['ui:options']: uiOptions = {} } = schema;

      function extract(type: 'listen' | 'emit') {
        return [
          ...Object.entries({ automations, pages }).flatMap(([key, list]) => {
            const events = new Set(
              Object.entries(list).flatMap(([, { events = {} }]) => {
                return events?.[type] || [];
              })
            );
            if (events.size === 0) return [];
            return [
              {
                label: t('events.autocomplete.label', {
                  context: key,
                  workspace: workspaceName,
                }),
                options: Array.from(events).map((event) => ({
                  label: event,
                  value: event,
                })),
              },
            ];
          }),
          ...Object.entries(imports).flatMap(([slug, { events = {} }]) => {
            if (!events || !events[type]) return [];
            const typedEvents = events[type];
            if (!typedEvents || typedEvents.length === 0) return [];

            return [
              {
                label: t('events.autocomplete.label', {
                  context: 'imports',
                  app: slug,
                }),
                options: typedEvents.map((event) => ({
                  label: event,
                  value: event,
                })),
              },
            ];
          }),
        ];
      }
      switch (uiOptions.autocomplete) {
        case 'events:listen': {
          return extract('listen');
        }
        case 'events:emit':
          return extract('emit');
      }

      return [];
    },
    [automations, imports, pages, t, workspaceName]
  );

  const uploadFile = useCallback(
    async (file: string) => {
      const [{ url, name }] = await api.uploadFiles(file, id);

      return url;
    },
    [id]
  );

  return { extractSelectOptions, extractAutocompleteOptions, uploadFile };
};

export default useSchema;
