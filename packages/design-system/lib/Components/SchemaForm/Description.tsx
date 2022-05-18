import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FC } from 'react';

interface DescriptionProps {
  text?: string;
  className?: string;
}

export const Description: FC<DescriptionProps> = ({
  children,
  text,
  className,
}) => {
  if (!text) return <>{children}</>;

  return (
    <div className={`relative w-full ${className}`}>
      {children}
      <Tooltip title={text} placement="left">
        <button type="button" className="absolute top-0 right-2">
          <InfoCircleOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default Description;
