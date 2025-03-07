import { Tree as AntdTree, TreeProps as AntdTreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';
import { Button, SearchInput } from '../index';
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

export interface TreeData {
  children?: TreeData[];
  key: React.Key;
  title: string;
  renderTitle?: React.ReactNode;
  selectable?: boolean;
  alwaysShown?: boolean;
  bold?: boolean;
  icon?: React.ReactNode;
  onAdd?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDelete?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface TreeProps extends AntdTreeProps {
  data: TreeData[] | undefined;
}

const Tree = ({
  data,
  defaultExpandAll,
  onSelect,
  ...treeProps
}: TreeProps) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    defaultExpandAll && data ? data.map((data) => data.key) : []
  );
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const flatennedData = useMemo(() => {
    if (!data) return [];
    const currentData: TreeData[] = [];

    const getData = (children: TreeData[]) => {
      children.forEach((childrenData) => {
        currentData.push({
          title: childrenData.title,
          key: childrenData.key,
          renderTitle: childrenData.renderTitle,
        });
        if (childrenData.children) {
          getData(childrenData.children);
        }
      });
    };

    getData(data);

    return currentData;
  }, [data]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!data || !flatennedData) return;

    const { value } = e.target;
    const newExpandedKeys = flatennedData
      .map((item) => {
        if (
          item.title &&
          item.title.toLowerCase().indexOf(value.toLowerCase()) > -1
        ) {
          return getParentKey(item.key, data);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys as React.Key[]);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const treeData = useMemo(() => {
    if (!data) return;

    const loop = (data: TreeData[]): DataNode[] =>
      data.flatMap((item) => {
        if (
          !item.children &&
          searchValue.length > 0 &&
          !item.title.toLowerCase().includes(searchValue.toLowerCase()) &&
          !item.alwaysShown
        ) {
          return [];
        }

        const title = (
          <div className="flex w-full m-1">
            <span
              className={`flex w-full justify-between items-center ${
                item.bold ? 'font-semibold' : ''
              }`}
            >
              <div className="flex justify-center items-center space-x-2">
                {item.icon ? item.icon : null}
                <span>{item.renderTitle || item.title}</span>
              </div>
              {item.onAdd && (
                <Button variant={'grey'} onClick={item.onAdd}>
                  <PlusSquareOutlined />
                </Button>
              )}
              {item.onDelete && (
                <Button variant={'grey'} onClick={item.onDelete}>
                  <DeleteOutlined />
                </Button>
              )}
            </span>
          </div>
        );
        if (item.children) {
          return [
            {
              title,
              key: item.key,
              children: loop(item.children),
              selectable: item.selectable,
            },
          ];
        }

        return [
          {
            title,
            key: item.key,
          },
        ];
      });

    return loop(data);
  }, [data, searchValue]);

  return (
    <>
      <SearchInput
        style={{ marginBottom: 8 }}
        placeholder="Search"
        onChange={onChange}
        className="!text-gray"
      />
      <AntdTree.DirectoryTree
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
        onSelect={onSelect}
        {...treeProps}
      />
    </>
  );
};

export default Tree;
