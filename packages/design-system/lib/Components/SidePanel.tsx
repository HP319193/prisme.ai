import { Layout } from '../index';
import React from 'react';

export interface SidePanelProps {
  children: React.ReactNode;
  variant?: 'rounded' | 'squared';
  className?: string;
  Header?: React.ReactNode;
}

const SidePanel = ({
  Header,
  className,
  variant = 'rounded',
  children,
}: SidePanelProps) => {
  if (variant === 'rounded') {
    return (
      <Layout Header={Header} className={`p-2 h-full ${className}`}>
        <div className="flex border border-gray-200 border-solid grow h-full rounded p-4">
          {children}
        </div>
      </Layout>
    );
  }

  return (
    <Layout Header={Header} className={`h-full ${className}`}>
      <div className="flex border border-gray-200 border-solid grow h-full p-4 !border-t-0">
        {children}
      </div>
    </Layout>
  );
};

export default SidePanel;
