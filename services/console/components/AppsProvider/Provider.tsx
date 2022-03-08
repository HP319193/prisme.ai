import { FC, useCallback, useState } from 'react';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import context, { AppsContext } from './context';
import api from '../../utils/api';

export const AppsProvider: FC = ({ children }) => {
  const [apps, setApps] = useState<AppsContext['apps']>(new Map());
  const [appInstances, setAppInstances] = useState<AppsContext['appInstances']>(
    new Map()
  );
  const { t } = useTranslation('errors');

  const getApps: AppsContext['getApps'] = useCallback(
    async (query, page) => {
      try {
        const fetchedApps = await api.getApps(query, page);
        const appMapUpdate: Map<string, Prismeai.App> = fetchedApps.reduce(
          (newMap, app) => newMap.set(app.id, app),
          new Map()
        );
        if (!isEqual(appMapUpdate, apps)) {
          await setApps(
            new Map([...Array.from(apps), ...Array.from(appMapUpdate)])
          );
        }
        return apps;
      } catch (e) {
        notification.error({
          message: t('api', { errorName: e }),
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

      if (!isEqual(fetchAppInstanceArray, appInstances.get(workspaceId))) {
        const newAppInstances = new Map(appInstances);
        newAppInstances.set(workspaceId, fetchAppInstanceArray);
        setAppInstances(newAppInstances);
      }

      return fetchAppInstanceArray;
    },
    [appInstances]
  );

  return (
    <context.Provider
      value={{
        apps,
        appInstances,
        getApps,
        getAppInstances,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default AppsProvider;
