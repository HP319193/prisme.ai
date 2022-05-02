import { PageHeader as AntdPageHeader } from 'antd';
import { ReactElement } from 'react';

export interface PageHeaderProps {
  title?: ReactElement | string;
  onBack: (e: any) => void;
  RightButtons?: JSX.Element[];
}

const PageHeader = ({
  title,
  onBack = () => null,
  RightButtons,
}: PageHeaderProps) => (
  <AntdPageHeader
    className="h-[72px] flex items-center"
    onBack={onBack}
    title={title}
    extra={RightButtons}
  />
);

export default PageHeader;
