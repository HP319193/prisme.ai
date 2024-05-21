import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, notification } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import copy from '../../utils/Copy';
import { useTracking } from '../Tracking';

interface ShareButtonProps {
  link: string;
}
export const ShareButton = ({ link }: ShareButtonProps) => {
  const { trackEvent } = useTracking();
  const { t } = useTranslation('workspaces');
  const copyLink = useCallback(() => {
    trackEvent({
      name: 'Copy link in Share Panel',
      action: 'click',
    });
    copy(link);
    notification.success({
      message: t('pages.share.copied'),
      placement: 'bottomRight',
    });
  }, [link, t, trackEvent]);
  return (
    <div className="flex flex-row ml-2 min-w-0 border border-transparent hover:border-ultra-light-accent rounded">
      <Button className="flex-1 !rounded-r-[0] !pl-2 overflow-hidden !min-w-0">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex items-center"
        >
          <LinkOutlined className="mr-1" />
          <span className="overflow-ellipsis overflow-hidden">{link}</span>
        </a>
      </Button>
      <Button variant="grey" onClick={copyLink} className="!rounded-l-[0]">
        <CopyOutlined />
      </Button>
    </div>
  );
};
export default ShareButton;
