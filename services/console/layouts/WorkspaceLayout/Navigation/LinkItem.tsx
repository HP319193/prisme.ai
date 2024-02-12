import { builtinBlocks } from '@prisme.ai/blocks';
import { useOpenState } from './OpenStateProvider';
import { Add } from './Add';
import { Tooltip } from 'antd';
import AngleIcon from '../../../icons/angle-down.svgr';
import PlusIcon from '../../../icons/plus-rounded.svgr';
import { StretchContent } from '@prisme.ai/design-system';
import Link from 'next/link';
import { Item } from './RootLinksGroup';
import { useTranslation } from 'next-i18next';
import Highlight from '../../../components/Highlight';
import { useNavigation } from './context';

const {
  ProductLayout: { useProductLayoutContext },
} = builtinBlocks;

export const LinkItem = ({
  type,
  icon,
  label,
  href,
  items,
  tooltip,
  active,
}: Item) => {
  const { t } = useTranslation('workspaces');
  const { opened, toggle } = useOpenState();
  const { sidebarOpen } = useProductLayoutContext();
  const { highlight } = useNavigation();

  if (items) {
    const visible = !!(href && opened.has(href)) || !!highlight;
    return (
      <>
        <div
          className={`product-layout-sidebar__item flex flex-row flex-1 w-[100%] ${
            visible ? '!opacity-100' : ''
          } self-start mr-[17px]  flex-col ${
            active ? 'product-layout-sidebar__item--selected' : ''
          } mt-[4px]`}
        >
          <button
            type="button"
            onClick={href ? toggle(href) : undefined}
            className="flex flex-row flex-1"
          >
            <div className="flex flex-1 flex-row mb-[15px]">
              <div
                className={`transition-all ${
                  sidebarOpen ? 'mr-[10px]' : 'mr-[40px]'
                }`}
              >
                {icon}
              </div>
              <div className="text-[#939CA6] text-[1rem] font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">
                <Highlight
                  highlight={highlight}
                  component={<span className="text-[#ecfd18] font-bold" />}
                >
                  {label}
                </Highlight>
              </div>
            </div>
          </button>
          <AngleIcon
            width={23}
            height={20}
            className={`transition-transform ${visible ? 'rotate-180' : ''}`}
          />
          <Add type={type} path={href}>
            <Tooltip
              title={t(`${type}s.create.label`, { context: 'inpath' })}
              placement="right"
            >
              <button
                type="button"
                className="flex self-start mt-[1px] mr-[16px] ml-[18px]"
              >
                <PlusIcon width={15} height={15} />
              </button>
            </Tooltip>
          </Add>
        </div>
        <StretchContent
          visible={visible}
          className={`bg-[#37465F] p-0  flex-none`}
        >
          <div
            className={`transition-all pb-[5px] ${
              sidebarOpen ? 'ml-[10px]' : 'ml-0'
            }`}
          >
            {items.map((props) => (
              <LinkItem key={props.href} {...props} />
            ))}
          </div>
        </StretchContent>
      </>
    );
  }
  if (href) {
    return (
      <Tooltip title={tooltip} placement="right">
        <div className="flex">
          <Link href={href}>
            <a className="flex flex-row mb-[15px]">
              <div
                className={`transition-all ${
                  sidebarOpen ? 'mr-[10px]' : 'mr-[40px]'
                }`}
              >
                {icon}
              </div>
              <div
                className={`${
                  active ? 'text-white' : 'text-[#939CA6]'
                } text-[1rem] font-normal overflow-hidden whitespace-nowrap overflow-ellipsis`}
              >
                <Highlight
                  highlight={highlight}
                  component={<span className="text-[#ecfd18] font-bold" />}
                >
                  {label}
                </Highlight>
              </div>
            </a>
          </Link>
        </div>
      </Tooltip>
    );
  }
  return null;
};

export default LinkItem;
