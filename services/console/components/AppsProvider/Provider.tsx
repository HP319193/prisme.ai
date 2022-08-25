import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import context, { AppsContext } from './context';
import api from '../../utils/api';
import { notification } from '@prisme.ai/design-system';
import { useWorkspace } from '../WorkspaceProvider';

export const AppsProvider: FC = ({ children }) => {
  const [apps, setApps] = useState<AppsContext['apps']>(new Map());
  const { workspace } = useWorkspace();
  const [appInstances, setAppInstances] = useState<AppsContext['appInstances']>(
    new Map()
  );
  const { t } = useTranslation('errors');

  const getApps: AppsContext['getApps'] = useCallback(
    async ({ query, page, limit, workspaceId } = {}) => {
      try {
        const fetchedApps = await api.getApps({
          query,
          page,
          limit,
          workspaceId,
        });
        const appMapUpdate: Map<string, Prismeai.App> = fetchedApps.reduce(
          (newMap, app) => newMap.set(app.slug, app),
          new Map()
        );
        if (!isEqual(appMapUpdate, apps)) {
          await setApps(
            new Map([...Array.from(apps), ...Array.from(appMapUpdate)])
          );
        }
        return fetchedApps;
      } catch (e) {
        notification.error({
          message: t('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
        return null;
      }
    },
    [apps, t]
  );

  const getAppInstances: AppsContext['getAppInstances'] = useCallback(
    async (workspaceId) => {
      const fetchedAppInstanceForWorkspace = await api.listAppInstances(
        workspaceId
      );

      const fetchAppInstanceArray = Object.values(
        fetchedAppInstanceForWorkspace
      );

      setAppInstances((appInstances) => {
        if (isEqual(fetchAppInstanceArray, appInstances.get(workspaceId))) {
          return appInstances;
        }
        const newAppInstances = new Map(appInstances);
        newAppInstances.set(workspaceId, fetchAppInstanceArray);
        return newAppInstances;
      });

      return fetchAppInstanceArray;
    },
    []
  );

  const saveAppInstance = useCallback(
    async (
      workspaceId: string,
      slug: string,
      appInstance: Prismeai.AppInstancePatch
    ) => {
      if (!workspaceId) return;
      return api.saveAppInstance(workspaceId, slug, appInstance);
    },
    []
  );

  return (
    <context.Provider
      value={{
        apps,
        appInstances,
        getApps,
        getAppInstances,
        saveAppInstance,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default AppsProvider;
