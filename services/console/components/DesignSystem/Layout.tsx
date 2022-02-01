import { Layout as AntdLayout } from "antd";
import { ReactNode } from "react";

export interface LayoutProps {
  className?: string;
  Header: ReactNode;
  Content: ReactNode;
  PageHeader?: ReactNode;
}

const Layout = ({ className, Header, Content, PageHeader }: LayoutProps) => (
  <AntdLayout className={`${className || ""} flex grow`}>
    <AntdLayout.Header>
      {Header}
      {PageHeader || null}
    </AntdLayout.Header>
    <AntdLayout.Content className="flex">{Content}</AntdLayout.Content>
  </AntdLayout>
);

export default Layout;
