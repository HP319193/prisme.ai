import React, { ReactElement } from 'react';
import { Layout, MenuTab } from '../';

export interface SidePanelProps {
  children: ReactElement;
  Header?: ReactElement;
}

const SidePanel = ({ Header, children }: SidePanelProps) => (
  <Layout Header={Header} className="m-2">
    <div className="border border-gray-200 border-solid grow h-full rounded p-4">
      {children}
    </div>
  </Layout>
);

export default SidePanel;
