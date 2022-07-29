import { Tree as AntdTree, TreeProps as AntdTreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';
import { SearchInput } from '../index';
import { PlusSquareOutlined } from '@ant-design/icons';

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
  selectable?: boolean;
  onAdd?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
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
        currentData.push({ title: childrenData.title, key: childrenData.key });
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
          !item.title.toLowerCase().includes(searchValue.toLowerCase())
        ) {
          return [];
        }

        const title = (
          <div className="flex w-full m-1">
            <span className={`flex w-full justify-between items-center`}>
              {item.title}
              {item.onAdd && (
                <div onClick={item.onAdd}>
                  <PlusSquareOutlined />
                </div>
              )}
            </span>
          </div>
        );
        if (item.children) {
          return [{ title, key: item.key, children: loop(item.children) }];
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
    <div>
      <SearchInput
        style={{ marginBottom: 8 }}
        placeholder="Search"
        onChange={onChange}
      />
      <AntdTree
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
        onSelect={onSelect}
        {...treeProps}
      />
    </div>
  );
};

export default Tree;
