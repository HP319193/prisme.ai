import { Switch, Button } from '@prisme.ai/design-system';
import { Events } from '@prisme.ai/sdk';
import { Tag } from 'antd';
import Color from 'color';
import { ColumnDefinition } from './types';

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
  events?: Events;
  language: string;
}

export const renderValue = ({
  key,
  type,
  language,
  format,
  onEdit,
  actions,
  events,
}: RenderValueAttributes) => (_: any, item: any) => {
  const value = key ? item[key] : undefined;
  switch (type) {
    case 'number': {
      const formatter = new Intl.NumberFormat(
        language,
        format as Intl.NumberFormatOptions
      );
      return formatter.format(+value);
    }
    case 'date': {
      const formatter = new Intl.DateTimeFormat(
        language,
        format as Intl.DateTimeFormatOptions
      );
      return formatter.format(new Date(value));
    }
    case 'boolean':
      return <Switch defaultChecked={!!value} disabled={!onEdit} />;
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
      if (actions) {
        return Array.isArray(actions) ? (
          <>
            {actions.map(({ label, event, payload, url }) => (
              <Button
                key={`${label}${event}${url}`}
                type="button"
                onClick={() => {
                  const { key, ...data } = item;
                  if (event) {
                    events?.emit(event, { ...payload, data, key });
                  }
                  if (url) {
                    const computedUrl = url.replace(
                      /\{\{([^}]+)\}\}/g,
                      (_, m) => item[m] || ''
                    );
                    window.open(computedUrl);
                  }
                }}
              >
                {label}
              </Button>
            ))}
          </>
        ) : null;
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
  }
};
export default renderValue;
