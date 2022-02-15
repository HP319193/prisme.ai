import React, { ReactElement } from 'react';
import { Layout } from '@prisme.ai/design-system';

export interface SidePanelProps {
  children: ReactElement;
  Header?: ReactElement;
  className?: string;
}

const SidePanel = ({ Header, children, className = '' }: SidePanelProps) => (
  <Layout Header={Header} className={`p-2 h-full ${className}`}>
    <div className="flex border border-gray-200 border-solid grow h-full rounded p-4">
      {children}
    </div>
  </Layout>
);

export default SidePanel;
