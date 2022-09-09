import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  Modal,
  notification,
  SearchInput,
  Title,
} from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import IconApps from '../icons/icon-apps.svgr';
import useLocalizedText from '../utils/useLocalizedText';
import { useWorkspace } from '../components/WorkspaceProvider';

interface AppStoreProps {
  visible: boolean;
  onCancel: () => void;
}

interface FilteredApps extends Prismeai.App {
  slug: string;
  name: string;
}

const isFilteredApp = (app: Prismeai.App): app is FilteredApps => {
  return !!app.slug && !!app.name;
};

const AppsStore = ({ visible, onCancel }: AppStoreProps) => {
  const { t } = useTranslation('workspaces');
  const { t: errorT } = useTranslation('errors');
  const { localize } = useLocalizedText();
  const { apps, getApps } = useApps();
  const {
    installApp,
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { push } = useRouter();
  const [filter, setFilter] = useState('');

  const filteredApps: FilteredApps[] = useMemo(
    () =>
      Array.from(apps)
        .flatMap(([key, app]) => {
          return `${localize(app.name)}`
            .toLowerCase()
            .includes(filter.toLowerCase())
            ? { ...app }
            : [];
        })
        .filter(isFilteredApp),
    [apps, filter, localize]
  );

  useEffect(() => {
    if (visible) {
      getApps({ limit: 300 });
    }
  }, [getApps, visible]);

  const onAppClick = useCallback(
    async (id: string, name: string) => {
      try {
        await installApp(workspaceId, {
          appSlug: id,
          appName: name,
        });
        push(`/workspaces/${workspaceId}/apps/${id}`);
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
      }
      onCancel();
    },
    [errorT, installApp, onCancel, push, workspaceId]
  );

  return (
    <Modal
      onCancel={onCancel}
      open={visible}
      footer={null}
      title={<div>{t('apps.title')}</div>}
      width="80vw"
    >
      <div className="flex flex-col h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between ml-10 mt-3">
          <SearchInput
            className="!min-w-[20rem] !text-gray"
            onChange={({ target: { value } }) => setFilter(value)}
            placeholder={t('apps.search')}
          />
        </div>
        <div className="flex flex-wrap flex-row align-start justify-center mt-5 overflow-y-auto">
          {filteredApps.map(({ slug, name, description, photo }) => (
            <div
              key={slug}
              className="flex flex-row w-[25rem] align-center items-center border rounded border-gray-500 p-4 m-[0.8rem] h-[9rem] cursor-pointer hover:bg-blue-200"
              onClick={() => onAppClick(slug, name)}
            >
              <div className="flex align-center justify-center w-[6rem] mr-4 flex-none">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    className="rounded text-blue h-[80px] w-[80px] object-cover"
                    alt={t('apps.photoAlt')}
                  />
                ) : (
                  <IconApps width={80} height={80} className="text-gray-200" />
                )}
              </div>
              <div className="flex flex-col grow justify-start h-full mt-3 overflow-hidden text-ellipsis leading-[1.3rem]">
                <Title level={4} className="!text-[16px]">
                  {name}
                </Title>
                <div className="text-[14px]">{localize(description)}</div>
                {/*  Get description language, fallback to en */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default AppsStore;
