import AccountLayout from './AccountLayout';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Error404 from '../Errors/404';
import { Loading } from '@prisme.ai/design-system';
import ShareWorkspace from '../../components/Share/ShareWorkspace';
import { useWorkspacesUsage } from '../../components/WorkspacesUsage';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Tooltip } from 'antd';
import lightning from '../../icons/lightning.svg';
import stat from '../../icons/stat.svg';
import { usePermissions } from '../../components/PermissionsProvider';
import { WarningOutlined } from '@ant-design/icons';

const SUBSCRIPTION_INTERACTION = 10000;
const SUBSCRIPTION_USERS = 1;

interface MyAccountProps {}

const DisabledButton = ({ children }: { children: string }) => {
  const { t } = useTranslation('user');

  return (
    <div
      // disabled
      // variant="link"
      className="ant-btn ant-btn-link !flex items-center justify-start !p-0 !text-[0.75rem] ml-2 !text-gray !cursor-not-allowed underline"
    >
      <Tooltip title={t('coming_soon')}>
        <div>{children}</div>
      </Tooltip>
    </div>
  );
};

const MyAccount = ({}: MyAccountProps) => {
  const { t } = useTranslation('user');
  const { t: workspaceT } = useTranslation('workspaces');

  const { workspaces } = useWorkspaces();
  const {
    query: { workspaceId },
  } = useRouter();

  const { workspacesUsage, fetchWorkspaceUsage, loading, error } =
    useWorkspacesUsage();

  const { getUsersPermissions, usersPermissions } = usePermissions();

  const initialFetch = useCallback(async () => {
    if (typeof workspaceId !== 'string') return;
    console.log('workspaceId', workspaceId);
    getUsersPermissions('workspaces', workspaceId);
  }, [getUsersPermissions, workspaceId]);

  useEffect(() => {
    if (typeof workspaceId !== 'string') return;
    initialFetch();
  }, [initialFetch, workspaceId]);

  const currentWorkspace = useMemo(
    () => workspaces.get(typeof workspaceId === 'string' ? workspaceId : ''),
    [workspaceId, workspaces]
  );

  console.log('workspacesUsage', workspacesUsage);

  useEffect(() => {
    console.log('fetch -1', fetchWorkspaceUsage);
    if (typeof workspaceId !== 'string') return; // redundant but needed for TS

    console.log('fetch');

    fetchWorkspaceUsage(workspaceId);
  }, [fetchWorkspaceUsage, workspaceId]);

  const currentWorkspaceUsages = useMemo(() => {
    if (typeof workspaceId !== 'string' || !currentWorkspace) return;
    const currentWorkspaceUsageObject = workspacesUsage.get(workspaceId);
    if (!currentWorkspaceUsageObject) return;

    return [
      {
        slug: currentWorkspace.name,
        total: currentWorkspaceUsageObject.total,
        photo: currentWorkspace.photo,
      },
      ...currentWorkspaceUsageObject.apps,
    ];
  }, [currentWorkspace, workspaceId, workspacesUsage]);

  if (!currentWorkspace || typeof workspaceId !== 'string') {
    return <Error404 link={`/account`} />;
  }

  const userCount =
    (usersPermissions.get(`workspaces:${workspaceId}`)?.length || 0) + 1;
  const userQuota = Math.min(userCount / SUBSCRIPTION_USERS, 100);

  const content = (
    <>
      <div className="flex flex-row h-full grow">
        <div className="flex flex-col grow m-[3.938rem] space-y-5 w-4/5">
          <div className="text-[3rem] font-bold">{currentWorkspace.name}</div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center text-gray font-semibold">
              <Image src={lightning.src} width={17} height={17} alt="" />
              <div className="ml-2">{t('billing.title')}</div>
            </div>
            <div className="flex flex-col ml-6">
              <div className="flex flex-row font-semibold text-[1.125rem]">
                {t('billing.free')}
                <DisabledButton>{t('billing.change')}</DisabledButton>
                {/*<Button*/}
                {/*  disabled*/}
                {/*  variant="link"*/}
                {/*  className="!flex items-center justify-start !p-0 !text-[0.75rem] ml-2"*/}
                {/*>*/}
                {/*  {t('billing.change')}*/}
                {/*</Button>*/}
              </div>
              <div className="flex flex-row">
                <div className="text-[0.75rem]">O</div>
                <div className="flex flex-col ml-2 text-gray text-[0.75rem]">
                  {t('billing.limit_ok')}
                  <div>
                    <DisabledButton>{t('billing.cta_premium')}</DisabledButton>
                    {/*<Button*/}
                    {/*  disabled*/}
                    {/*  variant="link"*/}
                    {/*  className="!flex items-center justify-start !p-0 !text-[0.75rem]"*/}
                    {/*>*/}
                    {/*  {t('billing.cta_premium')}*/}
                    {/*</Button>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex flex-row items-center text-gray font-semibold">
              <Image src={stat.src} width={17} height={17} alt="" />
              <div className="ml-2">{t('usage.title')}</div>
            </div>
            <div className="flex flex-col space-y-5">
              {error && (
                <div className="ml-6 flex flex-row text-red-700">
                  <WarningOutlined className="!flex items-center justify-center mr-2" />
                  <div>{t('usage.old')}</div>
                </div>
              )}
              {currentWorkspaceUsages?.map((workspaceUsage) => (
                <div key={workspaceUsage.slug} className="flex flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {workspaceUsage.photo ? (
                    <img
                      src={workspaceUsage.photo}
                      className={
                        'h-[3.125rem] w-[3.125rem] rounded-[0.625rem] mr-[1.25rem] object-contain'
                      }
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
                              userQuota * 100 >= 100
                                ? 'bg-orange-500'
                                : 'bg-accent'
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

          <div className="ml-2 font-bold">{workspaceT('workspace.share')}</div>
          <ShareWorkspace parentWorkspaceId={workspaceId} />
        </div>
        <div className="flex flex-col m-4 space-y-5 w-1/5">
          <div className="space-y-1">
            <div className="text-gray font-semibold">
              {t('billing.payment')}
            </div>
            <DisabledButton>{t('billing.payment_add')}</DisabledButton>
            {/*<Button*/}
            {/*  variant="link"*/}
            {/*  className="!flex justify-start !p-0"*/}
            {/*  disabled*/}
            {/*>*/}
            {/*  {t('billing.payment_add')}*/}
            {/*</Button>*/}
          </div>
          <div className="space-y-1">
            <div className="text-gray font-semibold">
              {t('billing.invoice')}
            </div>
            <DisabledButton>{t('billing.invoice_details')}</DisabledButton>
            {/*<Button*/}
            {/*  variant="link"*/}
            {/*  className="!flex justify-start !p-0"*/}
            {/*  disabled*/}
            {/*>*/}
            {/*  {t('billing.invoice_details')}*/}
            {/*</Button>*/}
          </div>
          <div className="space-y-1">
            <div className="text-gray font-semibold">
              {t('billing.history')}
            </div>
            {/*<div>Inkscape created</div>*/}
            {/*<div className="text-gray font-light">22/06/2021</div>*/}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AccountLayout>
      <Head>
        <title>
          {t('title.workspaceManagement', {
            workspaceName: currentWorkspace.name,
          })}
        </title>
      </Head>
      {loading ? <Loading /> : content}
    </AccountLayout>
  );
};

export default MyAccount;
