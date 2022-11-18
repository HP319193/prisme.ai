import { Button, Popover, Space } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import IFrameLoader from '../components/IFrameLoader';

const {
  publicRuntimeConfig: { HEADER_POPOVERS },
} = getConfig();

function getPopovers() {
  try {
    return Object.entries(JSON.parse(HEADER_POPOVERS) as [string, string]).map(
      ([label, href]) => ({
        label,
        href,
      })
    );
  } catch {
    return [];
  }
}
const POPOVERS = getPopovers();

export const HeaderPopovers = () => {
  const { t } = useTranslation('workspaces');

  return (
    <>
      {POPOVERS.map(({ label, href }) => (
        <Popover
          key={`${label}${href}`}
          content={() => (
            <div className="flex h-[75vh] w-[30rem]">
              <IFrameLoader className="flex flex-1" src={href} />
            </div>
          )}
          overlayClassName="pr-full-popover"
        >
          <Button variant="grey" className="!text-white">
            <Space className="text-lg">{t(label)}</Space>
          </Button>
        </Popover>
      ))}
    </>
  );
};

export default HeaderPopovers;
