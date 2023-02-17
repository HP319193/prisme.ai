import Image from 'next/image';
import stat from '../../../icons/stat.svg';
import { WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { AppUsageMetricsWithPhoto } from '../../../components/WorkspacesUsage';
import { ApiError } from '@prisme.ai/sdk';
import getConfig from 'next/config';

interface UsagesProps {
  appsUsages: AppUsageMetricsWithPhoto[];
  wpId: string;
  error?: ApiError;
}

const {
  publicRuntimeConfig: { BILLING_USAGE = '' },
} = getConfig();

const Usages = ({ appsUsages, wpId, error }: UsagesProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('user');

  return (
    <div className="space-y-5 flex flex-col">
      {BILLING_USAGE && (
        <>
          <div className="flex flex-row items-center text-gray font-semibold">
            <Image src={stat.src} width={17} height={17} alt="" />
            <div className="ml-2 uppercase">{t('usage.title')}</div>
          </div>
          <iframe
            height={150}
            src={`${BILLING_USAGE.replace(
              /\{\{lang\}\}/,
              language
            )}?workspaceId=${wpId}`}
          ></iframe>
        </>
      )}
      <div className="flex flex-col space-y-5 w-[44rem]">
        {error && (
          <div className="ml-6 flex flex-row text-red-700">
            <WarningOutlined className="!flex items-center justify-center mr-2" />
            <div>{t('usage.old')}</div>
          </div>
        )}
        {appsUsages && appsUsages.length > 0 && (
          <>
            <div className="flex flex-row items-center text-gray font-semibold">
              <Image src={stat.src} width={17} height={17} alt="" />
              <div className="ml-2 uppercase">{t('usage.apps.title')}</div>
            </div>
            {appsUsages.map((workspaceUsage) => (
              <div key={workspaceUsage.slug} className="flex flex-row">
                {workspaceUsage.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workspaceUsage.photo}
                    className={
                      'h-[3.125rem] w-[3.125rem] rounded-[0.625rem] mr-[1.25rem] object-contain'
                    }
                    alt=""
                  />
                ) : (
                  <div className="flex justify-center items-center h-[3.125rem] w-[3.125rem] rounded-[0.625rem] bg-[#E6EFFF] mr-[1.25rem]">
                    <div className="font-semibold text-accent">
                      {workspaceUsage.slug.substring(0, 2)}
                    </div>
                  </div>
                )}
                <div className="flex flex-1 justify-between">
                  <div>{workspaceUsage.slug}</div>
                  <div className="flex flex-col items-end text-right text-[0.75rem]">
                    <div className="flex flex-row justify-center items-center">
                      {workspaceUsage.total.transactions}
                      &nbsp;
                      {t('usage.interaction')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Usages;
