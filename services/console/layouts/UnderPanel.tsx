import { FC } from 'react';

interface UnderPanelProps {
  visible: boolean;
}

export const UnderPanel: FC<UnderPanelProps> = ({ children, visible }) => {
  return <div>{children}</div>;
};

export default UnderPanel;
