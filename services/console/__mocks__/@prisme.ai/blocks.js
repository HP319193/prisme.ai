export function BlockLoader({ children = null }) {
  return children;
}

const FakedBlock = () => null;
FakedBlock.styles = '';

export const builtinBlocks = {
  Form: FakedBlock,
  Cards: FakedBlock,
  Header: FakedBlock,
  Buttons: FakedBlock,
  Hero: FakedBlock,
  Breadcrumbs: FakedBlock,
  TabsView: FakedBlock,
  Action: FakedBlock,
};
export const CardVariants = [];
