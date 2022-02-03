import { Collapse as AntdCollapse } from "antd";

const { Panel } = AntdCollapse;

export interface CollapseProps {
  items: {
    label: string;
    content: string;
  }[];
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
