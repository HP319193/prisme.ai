import {
  Collapse as AntdCollapse,
  CollapseProps as AntdCollapseProps,
} from 'antd';
import { ReactElement, useCallback, useRef } from 'react';

const { Panel } = AntdCollapse;

export type CollapseItem = {
  key?: string;
  label: string | ReactElement;
  content: ReactElement | string | null;
  className?: string;
  onClick?: () => void;
  opened?: boolean;
};

export interface CollapseProps extends AntdCollapseProps {
  items: CollapseItem[];
  className?: string;
  light?: boolean;
  icon?: AntdCollapseProps['expandIcon'];
  expandIconPosition?: AntdCollapseProps['expandIconPosition'];
}

const Collapse = ({
  items,
  light,
  icon,
  expandIconPosition = 'right',
  className,
  ...collapseProps
}: CollapseProps) => {
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
      expandIcon={icon}
      expandIconPosition={expandIconPosition}
      onChange={click}
      className={`${className || ''} ${
        light
          ? 'pr-collapse-light !border !border-solid !border-gray-200 rounded !px-2 !py-1'
          : ''
      }`}
      {...collapseProps}
    >
      {items.map(({ key, label, content, className }, index) => (
        <Panel
          header={label}
          key={key || `${index}`}
          className={className || ''}
        >
          {content}
        </Panel>
      ))}
    </AntdCollapse>
  );
};

export default Collapse;
