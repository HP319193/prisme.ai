import { FC } from 'react';
import ClickAwayListener from 'react-click-away-listener';

const noop = () => {};
interface SidePanelProps {
  sidebarOpen: boolean;
  onClose?: () => void;
}

export const SidePanel: FC<SidePanelProps> = ({
  sidebarOpen,
  onClose = noop,
  children,
}) => {
  return (
    <ClickAwayListener onClickAway={onClose}>
      <div
        className={`
          absolute
          top-0
          left-full
          bottom-0
          p-4
          transition-transform
          transition-duration-100
          ease-in
          ${sidebarOpen ? '-translate-x-full' : ''}
          shadow-4
          z-4`}
      >
        {children}
      </div>
    </ClickAwayListener>
  );
};

export default SidePanel;
