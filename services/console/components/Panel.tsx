import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, SidePanel } from '@prisme.ai/design-system';
import { FC, useEffect, useState } from 'react';

const noop = () => null;
interface PanelProps {
  visible: boolean;
  onVisibleChange?: (v: boolean) => void;
  className?: string;
}
export const Panel: FC<PanelProps> = ({
  visible,
  onVisibleChange = noop,
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
        absolute top-0 bottom-0 -right-1/3 w-1/3 z-10 flex-col
        transition-transform
        ease-in
        duration-200
        overflow-hidden
        ${hidden ? '' : '-translate-x-full'}
        ${className || ''}
      `}
    >
      <SidePanel className="!bg-white overflow-hidden h-full rounded !p-0 m-2">
        <div className="flex flex-1 flex-col overflow-hidden h-full">
          <div className="flex justify-end">
            <Button variant="grey" onClick={() => setHidden(true)}>
              <CloseCircleOutlined />
            </Button>
          </div>
          {children}
        </div>
      </SidePanel>
    </div>
  );
};

export default Panel;
