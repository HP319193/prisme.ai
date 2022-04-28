import { Layout as AntdLayout } from 'antd';
import { HTMLAttributes, ReactNode } from 'react';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  Header?: ReactNode;
  children: ReactNode;
  PageHeader?: ReactNode;
  contentClassName?: string;
}

const Layout = ({
  className,
  contentClassName,
  Header,
  PageHeader,
  children,
  ...props
}: LayoutProps) => (
  <AntdLayout className={`${className || ''} flex grow flex-col`} {...props}>
    <AntdLayout.Header>
      {Header}
      {PageHeader || null}
    </AntdLayout.Header>
    <AntdLayout.Content className={`flex flex-col ${contentClassName}`}>
      {children}
    </AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
