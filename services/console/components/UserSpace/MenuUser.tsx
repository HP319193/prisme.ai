import { Menu } from 'antd';
import { useTranslation } from 'next-i18next';
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
        {
          key: '2',
          label: t('header.user.profile.title'),
          onClick: () => console.log('yo'),
        },
        {
          key: '3',
          label: t('header.user.settings.title'),
          onClick: () => console.log('yo'),
        },
        {
          key: '4',
          label: t('header.user.shortcuts.title'),
          onClick: () => console.log('yo'),
        },
        {
          key: '5',
          type: 'divider',
        },
        {
          key: '6',
          label: t('header.user.signout.title'),
          onClick: () => console.log('yo'),
        },
      ]}
    />
  );
};

export default MenuUser;
