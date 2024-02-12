import { useBlock } from '../../Provider';
import { BaseBlock } from '../BaseBlock';
import { BaseBlockConfig } from '../types';
import ProductLayoutProvider, { useProductLayoutContext } from './Provider';
import { ProductLayoutProps } from './types';
import Sidebar from './Sidebar';
import IconBack from './IconBack';
import IconGear from './IconGear';
import IconHome from './IconHome';
import IconShare from './IconShare';
import IconCharts from './IconCharts';

export const ProductLayout = ({
  sidebar,
  content,
  className,
}: ProductLayoutProps & BaseBlockConfig) => {
  return (
    <ProductLayoutProvider opened={sidebar?.opened}>
      <div className={`product-layout ${className}`}>
        <Sidebar {...sidebar} />
        <div className="product-layout-content">{content}</div>
      </div>
    </ProductLayoutProvider>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  flex: 1;
}
.product-layout-sidebar {
  --text-color: #F9F9F9;

  display: flex;
  flex-direction: column;
  flex: none;
  background-color: #020B1A;
  width: 81px;
  overflow: hidden;
  color: var(--text-color);
  transition: width 0.2s ease-in-out;
  position: relative;
}
.product-layout-sidebar a {
  color: inherit;
}
.product-layout-sidebar--open {
  width: 300px;
}
.product-layout-sidebar__header {
  display: flex;
  flex-direction: row;
  padding: 23px 20px;
  align-items: center;
}
.product-layout-sidebar__header--has-back {
  transition: margin .2s ease-in;
}
.product-layout-sidebar--open .product-layout-sidebar__header--has-back {
  margin-left: -61px;
}
.product-layout-sidebar__header-link {
  display: flex;
  flex-direction: row;
  margin-right: 16px;
}
.product-layout-sidebar__logo {
  display: flex;
  flex: none;
  width: 41px;
  height: 41px;
  justify-content: center;
  align-items: center;
}
.product-layout-sidebar__logo img {
  display: flex;
  flex-direction: row;
  width: 41px;
  height: 41px;
  border-radius: 8px;
  background: #D9D9D9;
  padding: 4px;
}
.product-layout-sidebar__title {
  display: flex;
  flex: 1;
  align-items: center;
  margin-left: 4px;
  margin-right: 10px;
  font-size: 14px;
  font-weight: 500;
}
.product-layout-sidebar__header-button {
  display: flex;
  width: 20px;
  height: 20px;
  outline: none;
  margin-right: 15px;
}
.product-layout-sidebar__header-button:last-child {
  margin-right: 0;
}
.product-layout-sidebar__items {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.product-layout-sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 40px;
  padding-right: 20px;
  position: absolute;
  bottom: 0;
  right: 0;
}
.product-layout-sidebar__toggle button {
  outline: none;
  transition: transform 0.2s ease-in-out;
  background: rgba(0,0,0,.4);
  padding: 10px;
  border-radius: 6px;
}
.product-layout-sidebar--open .product-layout-sidebar__toggle button {
  transform: rotate3d(0, 0, 1, 180deg);
}
.product-layout-sidebar__title {
  display: flex;
  flex-direction: row;
  overflow: hidden;
}
.product-layout-sidebar__title span {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.product-layout-sidebar__items {
  margin-top: 20px;
  overflow: auto;
}
.product-layout-sidebar__item {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  opacity: .3;
  transition: opacity 0.2s ease-in;
}
.product-layout-sidebar__item--selected,
.product-layout-sidebar__item:hover {
  opacity: 1;
}
.product-layout-sidebar__item-button {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 81px;
  margin-bottom: 35px;
  transition: margin .2s ease-in;
}
.product-layout-sidebar--open .product-layout-sidebar__item-button {
  margin-bottom: 10px;
}
.product-layout-sidebar__item-label {
  text-align: left;
  align-self: flex-start;
  margin-top: 4px;
}
.product-layout-sidebar__item-button .product-layout-sidebar__item-label {
  text-align: center;
  font-size: 10px;
  align-self: center;
  margin: 0;
  font-weight: 400;
  margin-top: 14px;
  transition: opacity .2s ease-in;
}
.product-layout-sidebar--open .product-layout-sidebar__item-button .product-layout-sidebar__item-label {
  opacity: 0;
}
.product-layout-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: #0A1D3B;
  min-width: 1px;
}
`;

export const ProductLayoutInContext = () => {
  const { config } = useBlock<ProductLayoutProps>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <ProductLayout {...config} />
    </BaseBlock>
  );
};
ProductLayoutInContext.styles = defaultStyles;
ProductLayoutInContext.Component = ProductLayout;
ProductLayoutInContext.useProductLayoutContext = useProductLayoutContext;
ProductLayoutInContext.IconGear = IconGear;
ProductLayoutInContext.IconShare = IconShare;
ProductLayoutInContext.IconBack = IconBack;
ProductLayoutInContext.IconHome = IconHome;
ProductLayoutInContext.IconCharts = IconCharts;

export default ProductLayoutInContext;
