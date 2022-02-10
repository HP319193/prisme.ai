import { Collapse as AntdCollapse } from 'antd';
import { ReactElement } from 'react';

const { Panel } = AntdCollapse;

export type CollapseItem = {
  label: string;
  content: ReactElement | string;
  className?: string;
};

export interface CollapseProps {
  items: CollapseItem[];
}

const Collapse = ({ items }: CollapseProps) => {
  if (!items) {
    return null;
  }

  return (
    <AntdCollapse bordered={false} expandIconPosition="right">
      {items.map(({ label, content, className }, index) => (
        <Panel
          header={label}
          key={`${index}-${label}`}
          className={className || ''}
        >
          {content}
        </Panel>
      ))}
    </AntdCollapse>
  );
};

export default Collapse;
