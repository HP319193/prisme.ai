import { Layout, Header, PageHeader } from '../index';
import { PageHeaderProps } from '../Components/PageHeader';
import { HeaderProps } from './Header';

export interface DualHeaderProps extends HeaderProps, PageHeaderProps {}

const DualHeader = ({
  workspaces,
  t,
  userName,
  userAvatar,
  icon,
  title,
  onBack,
}: DualHeaderProps) => (
  <Layout
    Header={
      <Header
        workspaces={workspaces}
        t={t}
        userName={userName}
        userAvatar={userAvatar}
        icon={icon}
      />
    }
  >
    <PageHeader title={title} onBack={onBack} />
  </Layout>
);

export default DualHeader;
