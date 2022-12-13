import { FrownOutlined } from '@ant-design/icons';
import { FunctionComponent } from 'react';

interface NotFoundProps {
  icon?: FunctionComponent<{ className?: string }>;
  text?: string;
}
export const NotFound = ({
  icon: Icon = FrownOutlined,
  text = 'Not found',
}: NotFoundProps) => {
  return (
    <div className="flex flex-1 items-center justify-center flex-col">
      <Icon className="text-9xl" />
      <div className="my-8 text-xl">{text}</div>
    </div>
  );
};

export default NotFound;
