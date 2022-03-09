import { Layout } from '../index';
import React from 'react';

export interface SidePanelProps {
  children: React.ReactNode;
  className?: string;
  Header?: React.ReactNode;
}

const SidePanel = ({ Header, className, children }: SidePanelProps) => (
  <Layout Header={Header} className={`p-2 h-full ${className}`}>
    <div className="flex border border-gray-200 border-solid grow h-full rounded p-4">
      {children}
    </div>
  </Layout>
);

export default SidePanel;
