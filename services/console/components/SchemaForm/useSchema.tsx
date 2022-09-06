import { Schema, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('workspaces');
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
      const pages: Set<Prismeai.Page> = store.pages || new Set();

      switch (uiOptions.autocomplete) {
        case 'events:listen': {
          const pagesEvents = Array.from(
            pages
          ).flatMap(({ name, blocks = [] }) =>
            blocks.flatMap(({ config: { updateOn } = {} }) =>
              updateOn ? { name: localize(name), event: updateOn } : []
            )
          );

          const apps: Prismeai.AppDetails[] = store.apps || [];
          const automations =
            store?.automations || store.workspace?.automations || {};
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
            ...(pagesEvents.length > 0
              ? [
                  {
                    label: t('pages.link'),
                    options: pagesEvents.map(({ name, event }) => ({
                      label: (
                        <div>
                          {event}
                          <span className="text-[10px] text-neutral-500">
                            {' '}
                            — {name}
                          </span>
                        </div>
                      ),
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
          const automations =
            store?.automations || workspace?.automations || {};

          const events = Object.keys(automations)
            .flatMap((key) => {
              const automation = automations[key];
              if (!automation.do || automation.do.length === 0) return [];
              return getEmitEvents(automation.do);
            })
            // Remove empty and deduplicate
            .filter(
              ({ event }, index, all) =>
                event &&
                !all.slice(0, index).find(({ event: e }) => e === event)
            );

          const pagesEvents = Array.from(
            pages
          ).flatMap(({ name, blocks = [] }) =>
            blocks.flatMap(({ config: { onInit } = {} }) =>
              onInit ? { name: localize(name), event: onInit } : []
            )
          );

          const generateEventsAutomations = (appName: string) => (
            event: string,
            autocomplete: Prismeai.Emit['emit']['autocomplete']
          ) => {
            if (!autocomplete || Object.keys(autocomplete).length === 0)
              return [event];
            // Only read first parameter while the UI is simple
            // To manage many parameters, we would need an autocomplete inside
            // the value autocompleted
            return Object.keys(autocomplete).flatMap((key) => {
              if (!event.match(`{{${key}}}`)) return;
              const template = autocomplete[key].template || '${value}';
              const { from, path } = autocomplete[key];
              if (!from || !path) return [];
              let config = workspace.config || {};
              if (from === 'appConfig') {
                config = workspace.imports?.[appName]?.config || {};
              }
              const values = readAppConfig(config, path).filter(Boolean);
              return (Array.isArray(values)
                ? values
                : [values]
              ).flatMap((value) =>
                template.replace('${value}', event.replace(`{{${key}}}`, value))
              );
            });
          };

          return [
            ...(events.length > 0
              ? [
                  {
                    label: store.workspace.name,
                    options: events
                      .flatMap(({ event, autocomplete }) =>
                        generateEventsAutomations('')(event, autocomplete)
                      )
                      .flatMap((event) => ({
                        label: event,
                        value: event,
                      })),
                  },
                ]
              : []),
            ...(pagesEvents.length > 0
              ? [
                  {
                    label: t('pages.link'),
                    options: pagesEvents.map(({ name, event }) => ({
                      label: (
                        <div>
                          {event}
                          <span className="text-[10px] text-neutral-500">
                            {' '}
                            — {name}
                          </span>
                        </div>
                      ),
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
                  options: emit.flatMap(({ event, autocomplete }) =>
                    generateEventsAutomations(appName)(
                      event,
                      autocomplete
                    ).flatMap((value) => ({
                      label: value,
                      value: `${slug}.${value}`,
                    }))
                  ),
                })
              ),
          ];
      }

      return [];
    },
    [store]
  );

  return { extractSelectOptions, extractAutocompleteOptions };
};

export default useSchema;
