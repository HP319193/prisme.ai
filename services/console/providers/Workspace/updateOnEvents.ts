import { Dispatch, SetStateAction } from 'react';
import { Events } from '../../utils/api';
import { Workspace } from './WorkspaceProvider';

type EventCallback = (workspace: Workspace, payload: any) => Workspace;
type EventsListeners = Record<string, EventCallback>;

function insertItemInWorkspaceList(
  workspace: Workspace,
  list: string,
  slug: string,
  item: any,
  prevSlug: string = slug
) {
  const currentList = workspace[list as keyof Workspace] || {};
  const exists = !!currentList[prevSlug as keyof typeof currentList];

  return {
    ...workspace,
    [list]: {
      ...Object.entries(workspace[list as keyof Workspace] || {}).reduce(
        (prev, [s, p]) => ({
          ...prev,
          [s === prevSlug ? slug : s]:
            s === prevSlug
              ? {
                  ...p,
                  ...item,
                }
              : p,
        }),
        {}
      ),
      ...(exists ? {} : { [slug]: item }),
    },
  };
}

function removeItemInWorkspaceList(
  workspace: Workspace,
  list: string,
  slug: string
) {
  return {
    ...workspace,
    [list]: Object.entries(workspace[list as keyof Workspace] || {}).reduce(
      (prev, [s, p]) =>
        s === slug
          ? prev
          : {
              ...prev,
              [s]: p,
            },
      {}
    ),
  };
}

const eventsListeners: EventsListeners = {
  'workspaces.automations.updated': (
    workspace,
    { slug, oldSlug, automation }
  ) =>
    insertItemInWorkspaceList(
      workspace,
      'automations',
      slug,
      automation,
      oldSlug
    ),
  'workspaces.automations.deleted': (workspace, { automationSlug }) =>
    removeItemInWorkspaceList(workspace, 'automations', automationSlug),
  'workspaces.pages.updated': (workspace, { slug, oldSlug, page }) =>
    insertItemInWorkspaceList(workspace, 'pages', slug, page, oldSlug),
  'workspaces.pages.deleted': (workspace, { pageSlug }) =>
    removeItemInWorkspaceList(workspace, 'pages', pageSlug),
  'workspaces.apps.configured': (workspace, { slug, oldSlug, appInstance }) =>
    insertItemInWorkspaceList(workspace, 'imports', slug, appInstance, oldSlug),
  'workspaces.apps.uninstalled': (workspace, { slug }) =>
    removeItemInWorkspaceList(workspace, 'imports', slug),
};

export const updateOnEvents = (
  events: Events,
  setWorkspace: Dispatch<SetStateAction<Workspace | undefined>>
) => {
  Object.entries(eventsListeners).forEach(([event, callback]) => {
    events.on(event, ({ payload }) => {
      setWorkspace((workspace) => workspace && callback(workspace, payload));
    });
  });
};

export default updateOnEvents;
