import { LoadingOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Popover, Space, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';
import SharePage from '../../components/Share/SharePage';

interface RightButtonsProps {
  page: Prismeai.Page;
  pageId?: string;
  viewMode: number;
  save: () => void;
  saving: boolean;
}

export const RightButtons = ({
  page,
  pageId,
  viewMode,
  save,
  saving,
}: RightButtonsProps) => {
  const { t } = useTranslation('workspaces');
  const shareElRef = useRef<HTMLDivElement>(null);
  const shareElWidth = shareElRef.current?.getBoundingClientRect().width || 0;

  return (
    <div
      className="flex flex-row transition-transform"
      style={{
        transform:
          viewMode === 0
            ? `translate3d(calc(100% - ${shareElWidth}px), 0, 0)`
            : undefined,
      }}
    >
      {page.slug && (
        <div ref={shareElRef}>
          <Popover
            content={() => (
              <SharePage pageId={`${pageId}`} pageSlug={page.slug || ''} />
            )}
            title={t('pages.share.label')}
          >
            <Button>
              <Space>
                <Tooltip title={t('pages.share.label')}>
                  <ShareAltOutlined className="text-lg" />
                </Tooltip>
              </Space>
            </Button>
          </Popover>
        </div>
      )}
      <Button onClick={save} disabled={saving} variant="primary">
        {saving && <LoadingOutlined />}
        {t('pages.save.label')}
      </Button>
    </div>
  );
};
export default RightButtons;
