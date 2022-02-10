import { PageHeader as AntdPageHeader } from 'antd';

export interface PageHeaderProps {
  title?: string;
  onBack: (e: any) => void;
  RightButtons?: JSX.Element[];
}

const PageHeader = ({
  title,
  onBack = () => null,
  RightButtons,
}: PageHeaderProps) => (
  <AntdPageHeader onBack={onBack} title={title} extra={RightButtons} />
);

export default PageHeader;
