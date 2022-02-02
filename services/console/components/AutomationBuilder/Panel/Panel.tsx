import { FC, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';

interface PanelProps {
  visible: boolean;
  onVisibleChange?: (v: boolean) => void;
}
export const Panel: FC<PanelProps> = ({
  visible,
  onVisibleChange,
  children,
}) => {
  const ref = useRef(null);

  return (
    <>
      <div ref={ref} className="absolute top-0 bottom-0 right-0" />
      {ref.current && (
        <Sidebar
          visible={visible}
          onHide={() => onVisibleChange && onVisibleChange(false)}
          position="right"
          modal={false}
          appendTo={ref.current}
          maskStyle={{ position: 'relative' }}
          className="w-30rem"
        >
          {children}
        </Sidebar>
      )}
    </>
  );
};

export default Panel;
