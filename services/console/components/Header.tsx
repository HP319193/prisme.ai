import { ReactElement, useMemo } from 'react';
import { LogoutOutlined } from '@ant-design/icons';
import {
  Avatar,
  Divider,
  Dropdown,
  Menu,
  Space,
} from '@prisme.ai/design-system';
import { useUser } from './UserProvider';
import { useTranslation } from 'next-i18next';
import logo from '../icons/icon-prisme.svg';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  title?: string | ReactElement;
  leftContent?: string | ReactElement;
}
const Header = ({ title, leftContent }: HeaderProps) => {
  const { t } = useTranslation('user');
  const { user, signout } = useUser();

  const userMenu = useMemo(
    () => (
      <Menu
        items={[
          {
            label: (
              <Space>
                <LogoutOutlined />

                {t('sign.out')}
              </Space>
            ),
            key: 'signout',
          },
        ]}
        onClick={(item) => {
          if (typeof item === 'string') return;
          switch (item.key) {
            case 'signout':
              signout();
          }
        }}
      />
    ),
    [signout, t]
  );

  return (
    <div className="relative px-6 flex flex-row w-full justify-between items-center pr-header z-20 bg-prisme-darkblue text-white">
      <Link href="/workspaces">
        <a>
          <Image {...logo} width="25px" height="20px" alt="Prisme.ai" />
        </a>
      </Link>
      {title}
      <div className="flex flex-row items-center">
        {leftContent}

        {leftContent && <Divider type="vertical" className="mr-4" />}

        {user && (
          <Dropdown Menu={userMenu} placement="bottomRight" arrow={false}>
            <Space>
              {user.firstName}
              {user.photo && <Avatar src={user.photo} />}
            </Space>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Header;
