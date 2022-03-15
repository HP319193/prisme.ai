import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, SearchInput, Title } from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import IconApps from '../icons/icon-apps.svgr';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import useLocalizedText from '../utils/useLocalizedText';

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
  const localize = useLocalizedText();
  const { apps, getApps } = useApps();
  const { installApp } = useWorkspaces();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const [filter, setFilter] = useState('');

  const filteredApps: FilteredApps[] = useMemo(
    () =>
      Array.from(apps)
        .flatMap(([key, app]) => {
          return `${app.name}`.toLowerCase().match(filter.toLowerCase())
            ? { ...app }
            : [];
        })
        .filter(isFilteredApp),
    [apps, filter]
  );

  useEffect(() => {
    if (visible) {
      getApps();
    }
  }, [getApps, visible]);

  const onAppClick = useCallback(
    async (id: string, name: string) => {
      await installApp(workspaceId, {
        appSlug: id,
        appName: name,
      });
      onCancel();
    },
    [installApp, workspaceId]
  );

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      footer={null}
      title={<div>{t('apps.title')}</div>}
      width="80vw"
    >
      <div className="flex flex-col h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between">
          <SearchInput
            className="!min-w-[20rem]"
            onChange={({ target: { value } }) => setFilter(value)}
            placeholder={t('apps.search')}
          />
        </div>
        <div className="flex flex-wrap flex-row align-start justify-center mt-5 overflow-y-auto">
          {filteredApps.map(({ slug, name, description, photo }) => (
            <div
              key={slug}
              className="flex flex-row w-[25rem] align-center items-center border rounded border-gray-200 p-4 m-2 h-[9rem] cursor-pointer hover:bg-blue-200"
              onClick={() => onAppClick(slug, name)}
            >
              <div className="flex align-center justify-center w-[6rem] mr-4">
                {photo ? (
                  <img
                    src={photo}
                    className="rounded text-blue h-[80px] w-[80px] object-cover"
                    alt={t('apps.photoAlt')}
                  />
                ) : (
                  <IconApps width={80} height={80} className="text-gray-200" />
                )}
              </div>
              <div className="flex flex-col grow justify-start h-full mt-3">
                <Title level={4}>{name}</Title>
                <div>{localize(description)}</div>
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
