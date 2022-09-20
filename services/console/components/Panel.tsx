import { Button, Layout } from '@prisme.ai/design-system';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';

const noop = () => null;
interface PanelProps {
  visible: boolean;
  title: string;
  onVisibleChange?: (v: boolean) => void;
  className?: string;
}
export const Panel: FC<PanelProps> = ({
  visible,
  title,
  onVisibleChange = noop,
  className,
  children,
}) => {
  const { t } = useTranslation('workspaces');
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (hidden) {
      const t = setTimeout(() => onVisibleChange(false), 200);
      return () => {
        clearTimeout(t);
      };
    }
  }, [hidden, onVisibleChange]);

  useEffect(() => {
    setTimeout(() => setHidden(!visible), 1);
  }, [visible]);

  return (
    <div
      className={`
        flex
        absolute top-0 bottom-0 -right-[30rem] w-[30rem] z-10 flex-col
        transition-transform
        ease-in
        duration-200
        overflow-hidden
        ${hidden ? '' : '-translate-x-full'}
        ${className || ''}
      `}
    >
      <Layout
        Header={
          <div className="flex w-full items-center justify-between flex-row p-5 bg-accent text-white font-semibold">
            <div className="flex items-center flex-row">
              <SettingOutlined className="text-[20px] font-bold mr-3" />
              {title}
            </div>
            <Button
              variant="grey"
              className="flex justify-center items-center !text-white"
              onClick={() => setHidden(true)}
            >
              <CloseCircleOutlined />
            </Button>
          </div>
        }
        className="m-4 rounded !bg-white overflow-hidden h-full border-solid border border-gray-200"
      >
        <div className="flex flex-1 flex-col overflow-y-scroll  h-full">
          <div className="flex flex-1 flex-col m-5">{children}</div>
        </div>
      </Layout>
    </div>
  );
};

export default Panel;
