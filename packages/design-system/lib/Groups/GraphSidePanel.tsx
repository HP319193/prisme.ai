import { Button, SidePanel } from '../';
import { CloseCircleOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

export interface GraphSidePanelProps {
  children: ReactElement;
}

const GraphSidePanel = ({ children }: GraphSidePanelProps) => (
  <SidePanel>
    <div>
      <div className="flex grow justify-end">
        <Button type="grey">
          <CloseCircleOutlined />
        </Button>
      </div>
      {children}
    </div>
  </SidePanel>
);

export default GraphSidePanel;
