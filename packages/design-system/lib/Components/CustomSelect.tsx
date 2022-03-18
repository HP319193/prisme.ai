import { SearchOutlined } from '@ant-design/icons';
import { Menu, Dropdown, DropDownProps } from 'antd';
import { Fragment, ReactElement, ReactNode, useMemo, useState } from 'react';

interface Option {
  value: string;
  label: string | ReactElement;
  // If label is a react element, set this string value to search in it
  searchable?: string;
}

interface OptionGroup {
  label: string | ReactElement;
  options: (string | Option)[];
}

export interface CustomSelectProps extends Omit<DropDownProps, 'overlay'> {
  options: (string | Option | OptionGroup)[];
  value: string;
  onChange: (v: string) => void;
  renderValue?: (label: string) => ReactNode;
  showSearch?: boolean;
}

const defaultRenderValue = (label: string) => label;

const isOption = (item: CustomSelectProps['options'][number]): item is Option =>
  typeof item !== 'string';
const isOptionGroup = (
  item: CustomSelectProps['options'][number]
): item is OptionGroup =>
  typeof item !== 'string' && !!(item as OptionGroup).options;

export const CustomSelect = ({
  value,
  onChange,
  options,
  renderValue = defaultRenderValue,
  showSearch,
  ...dropdownProps
}: CustomSelectProps) => {
  const [search, setSearch] = useState('');

  const menu = useMemo(() => {
    const filterOptions = (
      items: (string | Option | OptionGroup)[]
    ): (string | Option | OptionGroup)[] =>
      items.filter((item) => {
        if (isOptionGroup(item)) {
          return filterOptions(item.options).length > 0;
        }
        return `${
          isOption(item)
            ? `${item.searchable || item.label} ${item.value}`
            : item
        }`.match(search);
      });
    const renderOptions = (
      items: (string | Option | OptionGroup)[],
      parent?: string
    ): ReactElement[] => {
      return filterOptions(items).map((item, index) => {
        if (isOptionGroup(item)) {
          return (
            <Fragment key={`${parent}-${index}--`}>
              <Menu.Divider />
              <Menu.Item key={`${parent}-${index}`} className="font-bold">
                {item.label}
              </Menu.Item>
              {renderOptions(item.options, `${parent}-${index}`)}
            </Fragment>
          );
        }
        const option = isOption(item)
          ? item
          : { label: item, value: item, searchable: item };
        return (
          <Menu.Item
            key={`${parent}-${index}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Menu.Item>
        );
      });
    };
    return (
      <Menu>
        {showSearch && (
          <Menu.Item key="search" icon={<SearchOutlined />}>
            <input
              type="search"
              onClick={(e) => e.stopPropagation()}
              value={search}
              onChange={({ target: { value } }) => setSearch(value)}
              className="outline-none"
            />
          </Menu.Item>
        )}
        <Menu.ItemGroup key="options" className="max-h-[200px] overflow-auto">
          {renderOptions(options || [])}
        </Menu.ItemGroup>
      </Menu>
    );
  }, [options, showSearch, search, value]);

  if (!options) return null;

  return (
    <Dropdown overlay={menu} trigger={['click']} {...dropdownProps}>
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        {renderValue(value)}
      </a>
    </Dropdown>
  );
};

export default CustomSelect;
