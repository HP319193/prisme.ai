import { Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import { generatePageUrl } from '../../utils/urls';
import useLocalizedText from '../../utils/useLocalizedText';
import { readAppConfig } from '../AutomationBuilder/Panel/readAppConfig';

function getEmitEvents(
  doList: Prismeai.InstructionList
): Prismeai.Emit['emit'][] {
  if (!Array.isArray(doList)) return [];
  return (doList || []).flatMap((instruction) => {
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
  const {
    workspace: {
      slug: workspaceSlug = '',
      config: { value: config } = {},
      automations = {},
      pages = {},
    },
  } = useWorkspace();
  const extractSelectOptions = useCallback(
    (schema: Schema) => {
      const { 'ui:options': uiOptions = {} } = schema;

      switch (uiOptions.from) {
        case 'config':
          const { path = '' } = uiOptions;
          if (!path) return null;
          const values: string[] = readAppConfig(config, path);
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
                  value: slug ? generatePageUrl(workspaceSlug, slug) : id,
                };
              }
            ),
          ];
      }
      return null;
    },
    [automations, config, localize, pages, store.pageSections, workspaceSlug]
  );

  const extractAutocompleteOptions = useCallback((schema: Schema) => {
    const { ['ui:options']: uiOptions = {} } = schema;

    switch (uiOptions.autocomplete) {
      case 'events:listen': {
        return [];
      }
      case 'events:emit':
        return [];
    }

    return [];
  }, []);

  return { extractSelectOptions, extractAutocompleteOptions };
};

export default useSchema;
