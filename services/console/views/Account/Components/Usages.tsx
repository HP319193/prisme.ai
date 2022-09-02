import Image from 'next/image';
import stat from '../../../icons/stat.svg';
import { WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { AppUsageMetricsWithPhoto } from '../../../components/WorkspacesUsage';
import { ApiError } from '@prisme.ai/sdk';

const SUBSCRIPTION_USERS = 1;
const SUBSCRIPTION_INTERACTION = 10000;

interface UsagesProps {
  currentWorkspaceUsages: AppUsageMetricsWithPhoto[];
  nbUser: number;
  error?: ApiError;
}

const Usages = ({ currentWorkspaceUsages, nbUser, error }: UsagesProps) => {
  const { t } = useTranslation('user');

  const userCount = nbUser + 1;
  const userQuota = Math.min(userCount / SUBSCRIPTION_USERS, 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-row items-center text-gray font-semibold">
        <Image src={stat.src} width={17} height={17} alt="" />
        <div className="ml-2 uppercase">{t('usage.title')}</div>
      </div>
      <div className="flex flex-col space-y-5">
        {error && (
          <div className="ml-6 flex flex-row text-red-700">
            <WarningOutlined className="!flex items-center justify-center mr-2" />
            <div>{t('usage.old')}</div>
          </div>
        )}
        {currentWorkspaceUsages.map((workspaceUsage) => (
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
                  {userCount} / {SUBSCRIPTION_USERS}
                  &nbsp;
                  {t('usage.access')}
                  <div className="ml-2 w-[5rem] h-[5.1px] bg-[#BFD7FF] rounded overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(userQuota * 100, 2)}%`,
                      }}
                      className={`${
                        userQuota * 100 >= 100 ? 'bg-orange-500' : 'bg-accent'
                      } h-[5.1px]`}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-row justify-center items-center">
                  {workspaceUsage.total.transactions} /{' '}
                  {SUBSCRIPTION_INTERACTION}
                  &nbsp;
                  {t('usage.interaction')}
                  <div className="ml-2 w-[5rem] h-[5.1px] bg-[#BFD7FF] rounded overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(
                            (workspaceUsage.total.transactions /
                              SUBSCRIPTION_INTERACTION) *
                              100,
                            2
                          ),
                          100
                        )}%`,
                      }}
                      className={`${
                        (workspaceUsage.total.transactions /
                          SUBSCRIPTION_INTERACTION) *
                          100 >=
                        100
                          ? 'bg-orange-500'
                          : 'bg-accent'
                      } h-[5.1px]`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Usages;
