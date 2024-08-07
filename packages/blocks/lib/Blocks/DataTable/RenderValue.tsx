import { Switch, Button } from '@prisme.ai/design-system';
import { Tag } from 'antd';
import Color from 'color';
import { ColumnDefinition } from './types';
import { interpolate } from '../../interpolate';
import { useBlock } from '../../Provider';
import { RichText } from '../RichText';
import { useBlocks } from '../../Provider/blocksContext';
import _get from 'lodash.get';
import { isBlock } from '../utils/getContentType';
import GenericBlock from '../utils/GenericBlock';
import useLocalizedText from '../../useLocalizedText';

const generateColor = (str: string) => {
  const cyrb53 = function (str = '', seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  const h = cyrb53(str).toString(16).substring(0, 6);

  return `#${h}`;
};

interface RenderValueAttributes extends ColumnDefinition {
  colKey: string | undefined;
  language: string;
}

export const RenderValue = ({
  colKey,
  item,
  type,
  language,
  format,
  onEdit,
  actions,
}: RenderValueAttributes & { item: any }) => {
  const value = colKey ? _get(item, colKey) : undefined;
  const { events } = useBlock();
  const {
    components: { Link },
  } = useBlocks();
  const { localize } = useLocalizedText();
  if (isBlock(value)) return <GenericBlock content={value} />;

  switch (type) {
    case 'number': {
      try {
        const formatter = new Intl.NumberFormat(
          language,
          format as Intl.NumberFormatOptions
        );
        return formatter.format(+value);
      } catch {
        return +value;
      }
    }
    case 'date': {
      try {
        const formatter = new Intl.DateTimeFormat(
          language,
          format as Intl.DateTimeFormatOptions
        );
        return formatter.format(new Date(value));
      } catch {
        return value || '';
      }
    }
    case 'boolean':
      return <Switch checked={!!value} disabled={!onEdit} />;
    case 'tags':
      const tags = Array.isArray(value) ? value : [value];

      return (
        <>
          {tags.map((tag) => (
            <Tag
              color={generateColor(tag)}
              key={tag}
              style={{
                color: Color(generateColor(tag)).isLight()
                  ? 'inherit'
                  : 'white',
              }}
            >
              {tag}
            </Tag>
          ))}
        </>
      );
    case 'string':
    default:
      if (actions && Array.isArray(actions) && actions.length > 0) {
        return (
          <>
            {actions.map(
              ({ label, action: { type, value, payload, popup } = {} }) => {
                if (type === 'event') {
                  return (
                    <Button
                      key={`${localize(label)}${type}${value}`}
                      type="button"
                      onClick={() => {
                        if (!value) return;
                        const { key, ...data } = item;
                        events?.emit(value, {
                          ...interpolate(payload, data),
                          data,
                          key,
                        });
                      }}
                    >
                      {localize(label)}
                    </Button>
                  );
                }
                if (type === 'url') {
                  const { key, ...data } = item;
                  const href = interpolate(value, data);
                  return (
                    <Link href={href} target={popup ? '_blank' : undefined}>
                      {localize(label)}
                    </Link>
                  );
                }
              }
            )}
          </>
        );
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return <RichText>{value}</RichText>;
  }
};

export default RenderValue;
