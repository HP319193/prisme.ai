import { Collapse as AntdCollapse } from 'antd';
import { ReactElement, useCallback, useRef } from 'react';

const { Panel } = AntdCollapse;

export type CollapseItem = {
  label: string | ReactElement;
  content: ReactElement | string;
  className?: string;
  onClick?: () => void;
};

export interface CollapseProps {
  items: CollapseItem[];
  className?: string;
  light?: boolean;
}

const Collapse = ({ items, light }: CollapseProps) => {
  const prevClicked = useRef<string[]>([]);
  const click = useCallback(
    (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      const diff = keys.filter((x) => !prevClicked.current.includes(x));
      prevClicked.current = keys;
      diff.forEach((i: string) => {
        const item = items[+i];
        if (!item || !item.onClick) return;
        item.onClick();
      });
    },
    [items]
  );

  if (!items) {
    return null;
  }

  return (
    <AntdCollapse
      bordered={false}
      expandIconPosition="right"
      onChange={click}
      className={
        light
          ? 'pr-collapse-light !border !border-solid !border-gray-200 rounded !px-2 !py-1'
          : ''
      }
    >
      {items.map(({ label, content, className }, index) => (
        <Panel header={label} key={`${index}`} className={className || ''}>
          {content}
        </Panel>
      ))}
    </AntdCollapse>
  );
};

export default Collapse;
