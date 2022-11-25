import { Button } from '@prisme.ai/design-system';
import { FC, useEffect, useState } from 'react';
import { CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import LeftIcon from '../icons/chevron.svgr';

const noop = () => null;
interface PanelProps {
  visible: boolean;
  title: string;
  onVisibleChange?: (v: boolean) => void;
  className?: string;
  onBack?: () => void;
}
export const Panel: FC<PanelProps> = ({
  visible,
  title,
  onVisibleChange = noop,
  onBack,
  className,
  children,
}) => {
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
        bg-surface
        ${hidden ? '' : '-translate-x-full'}
        ${className || ''}
      `}
    >
      <div className="flex w-full items-center justify-between flex-row p-5 bg-dark-accent text-white font-semibold">
        <div className="flex items-center flex-row">
          {onBack && (
            <button
              onClick={onBack}
              className="flex mx-1 w-[20px] items-center"
            >
              <span className="flex rotate-90">
                <LeftIcon width=".8rem" height=".8rem" />
              </span>
            </button>
          )}
          {!onBack && (
            <SettingOutlined className="text-[20px] font-bold mr-3" />
          )}
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
      <div
        className="flex flex-1 flex-col overflow-y-scroll h-full 
        border-light-gray
        border-l"
      >
        {children}
      </div>
    </div>
  );
};

export default Panel;
