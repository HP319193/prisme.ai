import { getLayout } from './AccountLayout';
import { useTranslation } from 'next-i18next';
import Avatar from '../../icons/avatar.svgr';
import { useUser } from '../../components/UserProvider';
import React from 'react';
import Head from 'next/head';

interface MyAccountProps {}

const MyAccount = ({}: MyAccountProps) => {
  const { t } = useTranslation('user');
  const { user } = useUser();

  if (!user) {
    return;
  }

  return (
    <>
      <Head>
        <title>{t('title.myAccount')}</title>
      </Head>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1 m-[3.938rem]">
          <div className="text-[3rem] font-bold mb-[2rem]">
            {t('account_my')}
          </div>
          <div className="flex flex-row">
            <div className="flex justify-center items-center w-[4.375rem] h-[4.375rem] rounded-[100%] bg-gray-300 text-white mr-[1.875rem]">
              <Avatar width={32} height={32} />
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-[1.125rem]">
                {user.firstName || ''} {user.lastName || ''}
              </div>
              <div className="underline">{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

MyAccount.getLayout = getLayout;

export default MyAccount;
