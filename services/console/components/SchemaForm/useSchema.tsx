import {
  AudioOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import { Schema, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';
import useLocalizedText from '../../utils/useLocalizedText';
import { readAppConfig } from '../AutomationBuilder/Panel/readAppConfig';

export const getPreview = (mimetype: string, url: string) => {
  const [type] = mimetype.split(/\//);
  if (type === 'image') {
    return url;
  }

  if (mimetype === 'application/pdf') {
    return (
      <FilePdfOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  if (
    mimetype.includes('officedocument.wordprocessingml') ||
    mimetype.includes('msword') ||
    mimetype.includes('ms-word')
  ) {
    return (
      <FileWordOutlined className="text-4xl !text-accent flex items-center" />
    );
  }

  if (
    mimetype.includes('officedocument.spreadsheetml') ||
    mimetype.includes('ms-excel')
  ) {
    return (
      <FileExcelOutlined className="text-4xl !text-accent flex items-center" />
    );
  }

  if (
    mimetype.includes('officedocument.presentationml') ||
    mimetype.includes('ms-powerpoint')
  ) {
    return (
      <FilePptOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  if (type === 'audio') {
    return (
      <AudioOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  return (
    <FileTextOutlined className="text-4xl !text-accent flex items-center" />
  );
};

export const useSchema = (store: Record<string, any> = {}) => {
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const {
    workspace: {
      id,
      name: workspaceName,
      config: { value: workspaceConfig } = {},
      automations = {},
      pages = {},
      imports = {},
    },
  } = useWorkspace();

  const config = store.config || workspaceConfig;

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
            ...Object.entries(automations)
              .filter(([slug, { when: { endpoint = null } = {} }]) => {
                switch (uiOptions.filter) {
                  case 'endpoint':
                    return endpoint;
                  default:
                    return true;
                }
              })
              .map(([slug, { name, description }]) => ({
                label: (
                  <Tooltip title={localize(description)}>
                    <div className="flex flex-1">{localize(name) || slug}</div>
                  </Tooltip>
                ),
                value: slug,
              })),
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
      const [{ url, mimetype, name }] = await api
        .workspaces(id)
        .uploadFiles(file);

      return {
        value: url,
        preview: getPreview(mimetype, url),
        label: name,
      };
    },
    [id]
  );

  const extractFromConfig = useCallback(
    (path: string) => {
      const results = readAppConfig(config, path);
      return results[0] || null;
    },
    [config]
  );

  return {
    extractSelectOptions,
    extractAutocompleteOptions,
    uploadFile,
    extractFromConfig,
  };
};

export default useSchema;
