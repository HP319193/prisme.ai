import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FC } from 'react';

interface InfoBubbleProps {
  text?: string;
  className?: string;
}

export const InfoBubble: FC<InfoBubbleProps> = ({
  children,
  className = '',
  text,
}) => {
  if (!text) return <>{children}</>;

  return (
    <div className={`${className} pr-form-description`}>
      <Tooltip title={text} placement="right">
        <button type="button" className="pr-form-description__button">
          <InfoCircleOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default InfoBubble;
