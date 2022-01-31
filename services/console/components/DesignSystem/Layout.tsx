import { Layout as AntdLayout } from "antd";
import { ReactNode } from "react";

interface LayoutProps {
  Header: ReactNode;
  Content: ReactNode;
  PageHeader: ReactNode;
}

const Layout = ({ Header, Content, PageHeader }: LayoutProps) => (
  <AntdLayout>
    <AntdLayout.Header>
      {Header}
      {PageHeader}
    </AntdLayout.Header>
    <AntdLayout.Content>{Content}</AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
