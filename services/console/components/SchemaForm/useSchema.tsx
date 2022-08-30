import { Schema } from '@prisme.ai/design-system';
import { useCallback } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { readAppConfig } from '../AutomationBuilder/Panel/readAppConfig';

function getEmitEvents(
  doList: Prismeai.InstructionList
): Prismeai.Emit['emit'][] {
  return doList.flatMap((instruction) => {
    const [name] = Object.keys(instruction);
    const value = instruction[name as keyof typeof instruction];

    if (Array.isArray(value)) {
      return getEmitEvents(value as Prismeai.InstructionList);
    }
    if (name === 'conditions') {
      return Object.keys(value).flatMap((key) => getEmitEvents(value[key]));
    }
    if (name === 'repeat') {
      return getEmitEvents((value as Prismeai.Repeat['repeat']).do);
    }
    if (name !== 'emit') return [];
    return (instruction as Prismeai.Emit).emit;
  });
}

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
        case 'events:listen': {
          const apps: Prismeai.AppDetails[] = store.apps || [];
          const automations = store.workspace?.automations || {};
          const when: string[] = Object.keys(automations)
            .flatMap((key) => {
              const { events } = (automations[key] || {}).when || {};
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
            ...apps.flatMap(({ appName, events: { listen = [] } = {} }) =>
              listen.length === 0
                ? []
                : {
                    label: appName,
                    options: (listen || []).map((event) => ({
                      label: event,
                      value: event,
                    })),
                  }
            ),
          ];
        }
        case 'events:emit':
          const workspace = store.workspace as Prismeai.Workspace;
          const apps: Prismeai.AppDetails[] = store.apps || [];
          const automations = workspace?.automations || {};

          const events = Object.keys(automations).flatMap((key) => {
            const automation = automations[key];
            if (!automation.do || automation.do.length === 0) return [];
            return getEmitEvents(automation.do);
          });

          const generateEventsFromSource = (appName: string) => (
            event: string,
            source: Prismeai.Emit['emit']['source']
          ) => {
            if (!source || Object.keys(source).length === 0) return [event];
            const config = workspace.imports?.[appName]?.config || {};
            // Only read first parameter while the UI is simple
            // To manage many parameters, we would need an autocomplete inside
            // the value autocompleted
            return Object.keys(source).flatMap((key) => {
              if (!event.match(`{{${key}}}`)) return;
              const { from, path } = source[key];
              if (!from || !path) return [];
              const values = readAppConfig(config, path);
              return (Array.isArray(values)
                ? values
                : [values]
              ).flatMap((value) => event.replace(`{{${key}}}`, value));
            });
          };

          return [
            ...(events.length > 0
              ? [
                  {
                    label: store.workspace.name,
                    options: events.flatMap(({ event, source }) => ({
                      label: event,
                      value: event,
                    })),
                  },
                ]
              : []),
            ...apps
              .filter(({ events: { emit = [] } = {} }) => emit.length > 0)
              .flatMap(
                ({ events: { emit = [] } = {}, appName = '', slug = '' }) => ({
                  label: appName,
                  options: emit.flatMap(({ event, source }) =>
                    generateEventsFromSource(appName)(event, source).flatMap(
                      (value) => ({
                        label: value,
                        value: `${slug}.${value}`,
                      })
                    )
                  ),
                })
              ),
          ];
      }

      return [];
    },
    [store.apps, store.workspace]
  );

  return { extractSelectOptions, extractAutocompleteOptions };
};

export default useSchema;
