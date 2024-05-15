import { isLocalizedObject } from '@prisme.ai/design-system';
import { Dropdown, Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useMemo, useRef, useState } from 'react';
import { useBlock } from '../../Provider';
import useLocalizedText from '../../useLocalizedText';
import { MenuItem as MenuItemProps } from './types';

interface ContextMenuProps {
  items: MenuItemProps[];
  onSelect?: () => void;
  payload?: Record<string, any>;
}

export const ContextMenu = ({
  items,
  onSelect,
  payload: commonPayload,
}: ContextMenuProps) => {
  const { localize } = useLocalizedText();
  const { events } = useBlock();
  const actions = useRef<Map<string, Function>>(new Map());
  const menuItems = useMemo(() => {
    function createItem(
      { children, text, type, value, payload }: MenuItemProps,
      key: string
    ): ItemType {
      actions.current.set(key, () => {
        if (type === 'event') {
          return events?.emit(value, { ...commonPayload, ...payload });
        }
        // Other types are not already used
      });
      return {
        key,
        label: isLocalizedObject(text) ? localize(text) : text,
        children: Array.isArray(children)
          ? children.map((item, nextKey) =>
              createItem(item, `${key}-${nextKey}`)
            )
          : undefined,
      };
    }
    actions.current = new Map();
    return items.map((item, key) => createItem(item, `${key}`));
  }, [items, events, commonPayload]);
  return (
    <Menu
      onClick={({ key, ...rest }: { key: string }) => {
        actions.current.get(key)?.();
        onSelect?.();
      }}
      items={menuItems}
    />
  );
};

interface ContextMenuState {
  content: JSX.Element;
  visible: boolean;
  position: { x: number; y: number };
}
export const useContextMenu = () => {
  const [contextMenuSpec, setContextMenu] = useState<ContextMenuState>({
    content: <div />,
    visible: false,
    position: { x: 0, y: 0 },
  });

  return { contextMenuSpec, setContextMenu };
};

export const ContextMenuDropDown = ({
  content,
  visible,
  position,
  onClose,
}: ContextMenuState & {
  onClose: () => void;
}) => {
  return (
    <Dropdown
      overlay={content}
      trigger={['contextMenu']}
      open={visible}
      onOpenChange={onClose}
    >
      <div
        style={{
          position: 'absolute',
          left: `${position?.x}px`,
          top: `${position?.y}px`,
          zIndex: 99999,
        }}
      />
    </Dropdown>
  );
};
