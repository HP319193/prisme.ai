import { Input, Tree as AntdTree, TreeProps as AntdTreeProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';

const { Search } = Input;

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
  key: string | number;
  title: string;
}

export interface TreeProps extends AntdTreeProps {
  data: TreeData[] | undefined;
}

const Tree = ({ data, defaultExpandAll, ...treeProps }: TreeProps) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    defaultExpandAll && data ? data.map((data) => data.key) : []
  );
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onExpand = (newExpandedKeys: string[]) => {
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
        console.log('item', item.title.toLowerCase());
        console.log('value', value.toLowerCase());
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

    const loop = (data: DataNode[]): DataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 && searchValue.length > 0 ? (
            <span className="p-1 m-1 rounded border-solid border-b border-graph-background text-gray-200">
              {beforeStr}
              <span className="text-black">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span
              className={`p-1 m-1 ${
                searchValue.length > 0 ? 'text-gray-200' : ''
              }`}
            >
              {strTitle}
            </span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
        };
      });

    return loop(data);
  }, [searchValue]);

  return (
    <div>
      <Search
        style={{ marginBottom: 8 }}
        placeholder="Search"
        onChange={onChange}
      />
      <AntdTree
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={treeData}
        {...treeProps}
      />
    </div>
  );
};

export default Tree;
