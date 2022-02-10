import { Layout as AntdLayout } from 'antd';
import { ReactNode } from 'react';

export interface LayoutProps {
  className?: string;
  Header?: ReactNode;
  children: ReactNode;
  PageHeader?: ReactNode;
}

const Layout = ({ className, Header, PageHeader, children }: LayoutProps) => (
  <AntdLayout className={`${className || ''} flex grow flex-col`}>
    <AntdLayout.Header>
      {Header}
      {PageHeader || null}
    </AntdLayout.Header>
    <AntdLayout.Content className="flex flex-col	">
      {children}
    </AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
