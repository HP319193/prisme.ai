import { Collapse } from 'antd';
import { ReactElement, useMemo, useState } from 'react';
import ItemsGroup from '../../components/Navigation/ItemsGroup';

interface NestedNavigationProps {
  links: {
    slug: string;
    render: ReactElement;
    path: string;
  }[];
  open?: boolean;
}

type Path = {
  path: string;
  items: Path[];
};

export function buildNestedTree(paths: { path: string }[]) {
  const root: Path = {
    path: '',
    items: [],
  };
  paths.forEach(({ path }) => {
    let currentPath = root;
    const parts = path.split(/\//);
    parts.forEach((part) => {
      let nextPath = currentPath.items.find(({ path: p }) => p === part);
      if (!nextPath) {
        nextPath = {
          path: part,
          items: [],
        };
        currentPath.items.push(nextPath);
      }
      currentPath = nextPath;
    });
  });
  function sortItems(items: Path[]) {
    items.sort((a, b) => {
      if (a.items.length && !b.items.length) return -1;
      if (!a.items.length && b.items.length) return 1;
      if (a.path === b.path) return 0;
      return a.path < b.path ? -1 : 1;
    });
    items.forEach((item) => {
      if (item.items.length) sortItems(item.items);
    });
  }
  sortItems(root.items);
  console.log(JSON.stringify(root.items, null, '  '));
  return root.items;
}

interface LeafProps {
  item: Path;
  parentPath?: string;
  links: NestedNavigationProps['links'];
  open?: boolean;
}
const Leaf = ({
  item,
  parentPath,
  links,
  open: forcedOpen = false,
}: LeafProps) => {
  const [open, setOpen] = useState(forcedOpen);

  const nextParentPath = `${parentPath !== undefined ? `${parentPath}/` : ''}${
    item.path
  }`;
  const currentLink = links.find(({ path }) => path === nextParentPath);

  if (currentLink) {
    return currentLink.render;
  }
  return (
    <div className="bg-graph-border pl-4">
      <div className="bg-white">
        <ItemsGroup
          open={open}
          onClick={() => setOpen(!open)}
          title={item.path}
        >
          {item.items.map((nextItem) => (
            <Leaf
              key={nextItem.path}
              links={links}
              item={nextItem}
              parentPath={nextParentPath}
            />
          ))}
        </ItemsGroup>
      </div>
    </div>
  );
};

export const NestedNavigation = ({ links, open }: NestedNavigationProps) => {
  const tree = useMemo(() => buildNestedTree(links), [links]);

  return (
    <>
      {tree.map((item) => (
        <Leaf key={item.path} links={links} item={item} open={open} />
      ))}
    </>
  );
};

export default NestedNavigation;
