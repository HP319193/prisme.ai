import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  Button,
  Loading,
  Modal,
  notification,
  Title,
} from '@prisme.ai/design-system';
import IconApps from '../../icons/icon-apps.svgr';
import useLocalizedText from '../../utils/useLocalizedText';
import { useWorkspace } from '../../providers/Workspace';
import AppsProvider, { useApps } from '../../providers/Apps/AppsProvider';
import SearchInput from '../../components/Navigation/SearchInput';
import useScrollListener from '../../components/useScrollListener';
import { incrementName } from '../../utils/incrementName';
import { TrackingCategory, useTracking } from '../../components/Tracking';

interface AppStoreProps {
  visible: boolean;
  onCancel: () => void;
}

export const AppsStore = ({ visible, onCancel }: AppStoreProps) => {
  const { t } = useTranslation('workspaces');
  const { t: errorT } = useTranslation('errors');
  const { localize } = useLocalizedText();
  const { ref, bottom } = useScrollListener<HTMLDivElement>({ margin: -1 });
  const { apps, loading, filters, setFilters, hasMore, fetchNextApps } =
    useApps();
  const {
    installApp,
    workspace,
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { push } = useRouter();
  const { trackEvent } = useTracking();

  const onAppClick = useCallback(
    async (id: string) => {
      trackEvent({
        name: 'Add App',
        action: 'click',
      });
      try {
        const slug = incrementName(
          id,
          Object.values(workspace.imports || {}).map(({ slug }) => slug),
          '{{name}}-{{n}}'
        );

        await installApp({
          appSlug: id,
          slug,
        });
        push(`/workspaces/${workspaceId}/apps/${slug}`);
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
      }
      onCancel();
    },
    [
      errorT,
      installApp,
      onCancel,
      push,
      trackEvent,
      workspace.imports,
      workspaceId,
    ]
  );

  useEffect(() => {
    if (bottom) {
      fetchNextApps();
    }
  }, [bottom, fetchNextApps]);

  return (
    <Modal
      onCancel={onCancel}
      open={visible}
      footer={null}
      title={<div>{t('apps.title')}</div>}
      width="80vw"
    >
      <div className="flex flex-col h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between">
          <SearchInput
            value={filters.query || ''}
            onChange={(query) => {
              trackEvent({
                name: 'Search App',
                action: 'keydown',
              });
              setFilters({
                query,
              });
            }}
            placeholder={t('apps.search')}
          />
        </div>
        <div
          ref={ref}
          className="flex flex-1 flex-wrap flex-row justify-center mt-5 overflow-y-auto"
        >
          {loading && <Loading />}
          {!loading &&
            Array.from(apps).map(({ slug, name, description, photo }) => (
              <div
                key={slug}
                className="flex flex-row w-[25rem]  items-center border rounded border-gray-500 p-4 m-[0.8rem] h-[9rem] cursor-pointer hover:bg-blue-200"
                onClick={() => onAppClick(slug)}
              >
                <div className="flex justify-center w-[6rem] mr-4 flex-none">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      className="rounded h-[64px] w-[64px] object-contain"
                      alt={t('apps.photoAlt')}
                    />
                  ) : (
                    <IconApps
                      width={80}
                      height={80}
                      className="text-gray-200"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1 justify-start h-full mt-3 overflow-hidden text-ellipsis leading-[1.3rem]">
                  <Title level={4}>{slug}</Title>
                  <div>{localize(description)}</div>
                </div>
              </div>
            ))}
          {hasMore && (
            <Button onClick={fetchNextApps}>{t('events.more')}</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const AppStoreWithProvider = (props: AppStoreProps) => {
  return (
    <TrackingCategory category="Apps">
      <AppsProvider>
        <AppsStore {...props} />
      </AppsProvider>
    </TrackingCategory>
  );
};

export default AppStoreWithProvider;
