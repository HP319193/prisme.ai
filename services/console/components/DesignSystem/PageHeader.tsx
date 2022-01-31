import { PageHeader } from "antd";

interface PageHeaderProps {
  title: String;
  onBack: (e: any) => void;
  RightButtons?: JSX.Element[];
}

export default ({
  title,
  onBack = () => null,
  RightButtons,
}: PageHeaderProps) => (
  <PageHeader onBack={onBack} title={title} extra={RightButtons} />
);
