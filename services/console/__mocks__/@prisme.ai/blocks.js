export function BlockLoader({ children = null }) {
  return children;
}

const FakedBlock = () => null;
FakedBlock.styles = '';

const ProductLayout = () => null;
ProductLayout.useProductLayout = () => {};
ProductLayout.IconShare = function IconShare() {
  return null;
};
ProductLayout.IconGear = function IconGear() {
  return null;
};

export const builtinBlocks = {
  Form: FakedBlock,
  Cards: FakedBlock,
  Header: FakedBlock,
  Buttons: FakedBlock,
  Hero: FakedBlock,
  Breadcrumbs: FakedBlock,
  TabsView: FakedBlock,
  Action: FakedBlock,
  ProductLayout,
};
export const CardVariants = [];
export const BlockProvider = (props) => {
  if (props.children.type === ProductLayout) {
    return props.config.content;
  }
  props.children;
};
