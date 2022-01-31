import { Layout } from "antd";
import { ReactNode } from "react";
import { PageHeader } from "../../index";

interface LayoutProps {
  Header: ReactNode;
  Content: ReactNode;
  PageHeader: ReactNode;
}

export default ({ Header, Content, PageHeader }: LayoutProps) => (
  <Layout>
    <Layout.Header>
      <div>{Header}</div>
      <div>{PageHeader}</div>
    </Layout.Header>
    <Layout.Content>{Content}</Layout.Content>
  </Layout>
);
