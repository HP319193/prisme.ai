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
  'workspaces.automations.updated': (workspace, { slug, automation }) =>
    insertItemInWorkspaceList(workspace, 'automations', slug, automation),
  'workspaces.automations.deleted': (workspace, { automationSlug }) =>
    removeItemInWorkspaceList(workspace, 'automations', automationSlug),
  'workspaces.pages.updated': (workspace, { slug, page }) =>
    insertItemInWorkspaceList(workspace, 'pages', slug, page),
  'workspaces.pages.deleted': (workspace, { pageSlug }) =>
    removeItemInWorkspaceList(workspace, 'pages', pageSlug),
  'workspaces.apps.configured': (workspace, { slug, oldSlug, appInstance }) =>
    insertItemInWorkspaceList(workspace, 'imports', slug, appInstance, oldSlug),
  'workspaces.apps.deleted': (workspace, { pageSlug }) =>
    removeItemInWorkspaceList(workspace, 'pages', pageSlug),
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
  // events.on(
  //   'workspaces.pages.created',
  //   ({ payload: { page: { slug, ...page } } = {} }) => {
  //     setWorkspace(
  //       (workspace) =>
  //         workspace && {
  //           ...workspace,
  //           pages: {
  //             ...Object.entries(workspace.pages || {}).reduce(
  //               (prev, [s, p]) => ({
  //                 ...prev,
  //                 [s]: s === slug ? page : p,
  //               }),
  //               {}
  //             ),
  //             ...(workspace.pages?.[slug] ? {} : page),
  //           },
  //         }
  //     );
  //   }
  // );
};

export default updateOnEvents;
