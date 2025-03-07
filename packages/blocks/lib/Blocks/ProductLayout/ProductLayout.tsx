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
import Content from './Content';
import GenericBlock from '../utils/GenericBlock';
import { useMemo } from 'react';

export const ProductLayout = ({
  sidebar,
  content,
  className,
  toastOn,
  assistant,
}: ProductLayoutProps & BaseBlockConfig) => {
  const toastBlocks = useMemo(
    () => toastOn && [{ slug: 'Toast', toastOn }],
    [toastOn]
  );

  return (
    <ProductLayoutProvider opened={sidebar?.opened}>
      <div className={`product-layout ${className}`}>
        {sidebar && <Sidebar {...sidebar} />}
        <Content content={content} assistant={assistant} />
        {toastBlocks && <GenericBlock content={toastBlocks} />}
      </div>
    </ProductLayoutProvider>
  );
};

const defaultStyles = `
:block {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  width: 100%;
  flex: 1;
}
.product-layout-sidebar {
  --text-color: var(--secondary-text);

  display: flex;
  flex-direction: column;
  flex: none;
  background-color: var(--layout-surface-secondary);
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
  padding: 23px 20px 23px 6px;
  align-items: center;
}
.product-layout-sidebar__header--has-back {
  transition: margin .2s ease-in;
  padding: 23px 20px;
}
.product-layout-sidebar--open .product-layout-sidebar__header--has-back {
  margin-left: -61px;
}
.product-layout-sidebar__header-link {
  display: flex;
  flex-direction: row;
  margin-right: 1rem;
  margin-left: 16px;
}
.product-layout-sidebar__header--has-back .product-layout-sidebar__header-link {
  margin-right: 0;
}
.product-layout-sidebar__header-link--button {
  margin-left: 1rem;
}
.product-layout-sidebar__logo {
  display: flex;
  flex: none;
  width: 41px;
  height: 41px;
  justify-content: center;
  align-items: center;
}
.product-layout-sidebar__logo--default {
  display: flex;
  flex-direction: row;
  width: 41px;
  height: 41px;
  border-radius: 8px;
  padding: 4px;
  font-weight: 700;
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
.product-layout-sidebar__item-icon .icon-svg {
  display: flex;
  width: 20px;
  height: 20px;
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
  white-space: nowrap;
}
.product-layout-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: var(--main-surface);
  min-width: 1px;
  padding: 42px 26px 26px 26px;
  max-height: 100vh;
}
.product-layout-content-title {
  color: var(--main-text);
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 26px;
  margin-bottom: 12px;
}
.product-layout-content-description {
  color: var(--main-text);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  margin-bottom: 40px;
}
.product-layout-content-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
}
.product-layout-content-tabs {
  color: var(--main-text);
  margin-bottom: 22px;
}
.product-layout-content-tab {
  color: var(--main-text);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 26px;
  opacity: .3;
  transition: opacity .2s ease-in;
  padding-right: 28px;
}
.product-layout-content-tab--active {
  opacity: 1;
}
.product-layout-content-additional-buttons {
  margin-right: -14px;
  display: flex;
  flex-direction: row;
}
.product-layout-content-ctn {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: auto;
}
.product-layout-content-panel {
  color: var(--main-element-text);
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
}
.product-layout-content-panel > * {
  overflow: auto;
}
.product-layout-content-panel--1col {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--main-element);
  padding: 14px;
  border-radius: 10px;
}
.product-layout-content-panel--2col,
.product-layout-content-panel--3col {
  display: flex;
  flex: 1;
  flex-direction: row;
}
.product-layout-content-panel--2col > .pr-block-blocks-list__block,
.product-layout-content-panel--3col > .pr-block-blocks-list__block {
  display: flex;
  flex-direction: column;
  background: var(--main-element);
  padding: 14px;
  border-radius: 10px;
}
.product-layout-content-panel--2col > .pr-block-blocks-list__block:nth-child(1),
.product-layout-content-panel--3col > .pr-block-blocks-list__block:nth-child(1),
.product-layout-content-panel--3col > .pr-block-blocks-list__block:nth-child(3) {
  max-width: 33%;
}
.product-layout-content-panel--2col > .pr-block-blocks-list__block:nth-child(2),
.product-layout-content-panel--3col > .pr-block-blocks-list__block:nth-child(2) {
  flex: 1;
  margin-left: 26px;
}
.product-layout-content-panel--3col > .pr-block-blocks-list__block:nth-child(2) {
  margin-right: 26px;
}
.product-layout-content-panel .ant-table-tbody>tr>td {
  border: none;
}
.product-layout-assistant-ctn {
  --assistant-width: 400px;
  display: flex;
  position: relative;
  width: calc(var(--assistant-width) - 2rem);
  margin-right: calc(var(--assistant-width) * -1);
  margin-left: 2rem;
  transition: margin-right .2s ease-in;
  overflow: auto;
}
.product-layout-assistant-ctn.visible {
  margin-right: 0;
}
.product-layout-assistant__handle {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  left: -2rem;
  width: 2rem;
  cursor: col-resize;
}
.product-layout-assistant-ctn.visible .product-layout-assistant__handle {
  display: flex;
}
.product-layout-assistant__handle svg {
  height: 2rem;
  width: 2rem;
  color: var(--accent-contrast-color);
}
.product-layout-assistant {
  width: 100%;
  height: 100%;
  border-radius: 10px;
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
