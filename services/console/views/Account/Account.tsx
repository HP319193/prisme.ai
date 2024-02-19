import { useTranslation } from 'next-i18next';
import { useUser } from '../../components/UserProvider';
import React from 'react';
import Head from 'next/head';
import Avatar from '../../components/UserSpace/Avatar';
import { BlockProvider } from '@prisme.ai/blocks';
import { builtinBlocks } from '@prisme.ai/blocks';
import UserForm from './UserForm';
import SecurityForm from './SecurityForm';
import InterfaceForm from './InterfaceForm';

const { ProductLayout } = builtinBlocks;

const Account = () => {
  const { t } = useTranslation('user');
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('title.myAccount')}</title>
      </Head>
      <BlockProvider
        config={{
          sidebar: null,
          content: {
            title: (
              <div className="product-layout-content-title !text-[48px] !leading-[48px]">
                {t('account.label')}
              </div>
            ),
            description: (
              <div className="product-layout-content-description flex flex-row mt-[40px]">
                <div className="relative w-[70px]">
                  <Avatar size="70px" />
                </div>
                <div className="flex flex-col justify-evenly ml-[30px] text-main-text">
                  <div className="text-[18px] font-bold">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-[12px] underline">{user.email}</div>
                </div>
              </div>
            ),
            tabs: [
              {
                title: t('account.settings.user.label'),
                content: (
                  <div className="product-layout-content-panel product-layout-content-panel--1col">
                    <UserForm />
                  </div>
                ),
              },
              // {
              //   title: t('account.settings.security.label'),
              //   content: (
              //     <div className="product-layout-content-panel product-layout-content-panel--1col">
              //       <SecurityForm />
              //     </div>
              //   ),
              // },
              // {
              //   title: t('account.settings.interface.label'),
              //   content: (
              //     <div className="product-layout-content-panel product-layout-content-panel--1col">
              //       <InterfaceForm />
              //     </div>
              //   ),
              // },
            ],
          },
        }}
      >
        <ProductLayout />
      </BlockProvider>
    </>
  );

  // return (
  //   <>
  //     <Head>
  //       <title>{t('title.myAccount')}</title>
  //     </Head>
  //     <div className="px-[50px] py-[23px] bg-main-surface">
  //       <h1 className="text-main-text text-[48px] font-bold">
  //         {t('account_my')}
  //       </h1>
  //       <div className="flex flex-row">
  //         <div className="relative w-[70px]">
  //           <Avatar size="70px" />
  //           <button className="absolute bottom-0 right-0">
  //             <EditIcon className="text-accent" height="20px" width="20px" />
  //           </button>
  //         </div>
  //         <div className="text-main-text">
  //           <label>
  //             {user.firstName} {user.lastName}
  //             <button>Edit</button>
  //           </label>
  //         </div>
  //       </div>
  //       <Tabs
  //         items={[
  //           {
  //             key: 'user',
  //             label: 'user',
  //             children: (
  //               <SchemaForm
  //                 schema={schema}
  //                 initialValues={user}
  //                 buttons={[
  //                   <SubmitButton key="submit" updating={updating}>
  //                     {t('edit.submit')}
  //                   </SubmitButton>,
  //                 ]}
  //                 onSubmit={submit}
  //                 autoFocus
  //                 locales={{
  //                   uploadLabel: t('schemaForm.uploadLabel', { ns: 'common' }),
  //                 }}
  //               />
  //             ),
  //           },
  //         ]}
  //       />
  //     </div>
  //   </>
  // );
};

export default Account;
