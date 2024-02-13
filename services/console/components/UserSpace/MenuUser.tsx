import { Menu } from 'antd';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useUser } from '../UserProvider';
import Avatar from './Avatar';

export const MenuUser = () => {
  const { t } = useTranslation('user');
  const { user } = useUser();
  return (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div className="flex flex-row">
              <div className="mr-[12px]">
                <Avatar size="40px" />
              </div>
              <div className="flex flex-col">
                <div className="text-[#171C24] text-[14px] font-semibold">
                  {user.firstName}
                </div>
                <div className="text-[#939CA6] text-[12px] font-normal">
                  {user.email}
                </div>
              </div>
            </div>
          ),
          onClick: () => console.log('yo'),
          style: {
            pointerEvents: 'none',
          },
        },
        /*{
          key: '2',
          label: <Link href="/profile">{t('header.user.profile.title')}</Link>,
        },*/
        {
          key: '3',
          label: <Link href="/account">{t('header.user.settings.title')}</Link>,
        },
        /*{
          key: '4',
          label: (
            <Link href="/shortcuts">{t('header.user.shortcuts.title')}</Link>
          ),
        },*/
        {
          key: '5',
          type: 'divider',
        },
        {
          key: '6',
          label: <Link href="/signout">{t('header.user.signout.title')}</Link>,
        },
      ]}
    />
  );
};

export default MenuUser;
