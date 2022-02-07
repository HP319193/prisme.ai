import { Collapse as AntdCollapse } from 'antd';

const { Panel } = AntdCollapse;

export type CollapseItem = {
  label: string;
  content: string;
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
      {items.map(({ label, content }, index) => (
        <Panel header={label} key={`${index}-${label}`}>
          <p>{content}</p>
        </Panel>
      ))}
    </AntdCollapse>
  );
};

export default Collapse;
