import { Layout as AntdLayout } from "antd";
import { ReactNode } from "react";

export interface LayoutProps {
  Header: ReactNode;
  Content: ReactNode;
  PageHeader?: ReactNode;
}

const Layout = ({ Header, Content, PageHeader }: LayoutProps) => (
  <AntdLayout className="h-screen">
    <AntdLayout.Header>
      {Header}
      {PageHeader || null}
    </AntdLayout.Header>
    <AntdLayout.Content>{Content}</AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
