import { Layout as AntdLayout } from "antd";
import { ReactNode } from "react";

interface LayoutProps {
  Header: ReactNode;
  Content: ReactNode;
}

const Layout = ({ Header, Content }: LayoutProps) => (
  <AntdLayout className="h-screen">
    <AntdLayout.Header>{Header}</AntdLayout.Header>
    <AntdLayout.Content>{Content}</AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
