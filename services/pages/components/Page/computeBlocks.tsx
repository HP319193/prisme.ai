import jsonpath from 'jsonpath';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import equal from 'fast-deep-equal';

import('dayjs/locale/en');
import('dayjs/locale/fr');

dayjs.extend(LocalizedFormat);

const TEMPLATE_IF = 'template.if';
const TEMPLATE_REPEAT = 'template.repeat';

type Repeat = {
  on: string;
  as?: string;
};
interface TemplatedBlock {
  [TEMPLATE_IF]?: string;
  [TEMPLATE_REPEAT]?: Repeat;
  [k: string]: any;
}

interface Config {
  blocks?: TemplatedBlock[] | string;
  [k: string]: any;
}
export const cleanAttribute = (values: any) => (attribute: string) => {
  const trimed = attribute.trim();
  if (trimed.match(/^'.+'$/) || trimed.match(/^".+"$/)) {
    return trimed.substring(1, trimed.length - 1);
  }

  try {
    return jsonpath.value(values, trimed);
  } catch {
    return undefined;
  }
};

export function applyFilter(filter: string, value: string, values: any) {
  if (!filter) return value;
  const [fn, attrs = ''] = filter.split(/\:/);
  switch (fn) {
    case 'date':
      const [format = '', lang = 'en'] = attrs
        .split(/,/)
        .map(cleanAttribute(values));
      return dayjs(value).locale(lang).format(format);
    case 'if':
      const [True, False] = attrs.split(/,/).map(cleanAttribute(values));
      return value ? True : False;
    default:
      return value;
  }
}

export function interpolateExpression(expression: string, values: any) {
  let newValue = expression;

  // Unique value, can be casted
  const uniqueMatch = expression.match(/^{{[^}]+}}$/);

  const matches = expression.match(/{{[^}]+}}/g);

  matches?.forEach((match) => {
    const [, expr] = match.match(/{{([^}]+)}}/) || [];
    const [_key, ...filters] = expr.split(/\|/);
    const key = _key.trim();
    let interpolation =
      key === '$index' ? values.$index : jsonpath.value(values, key);
    if (filters) {
      interpolation = filters
        .filter(Boolean)
        .reduce(
          (prev, filter) => applyFilter(filter, prev, values),
          interpolation
        );
    }
    if (typeof interpolation === 'object' || uniqueMatch) {
      newValue = interpolation;
      return;
    }
    newValue = newValue.replace(
      match,
      interpolation === undefined ? '' : interpolation
    );
  });

  return newValue;
}

export function testCondition(condition: string = '', values: any) {
  if (!condition) return true;
  const [, invert, result] =
    `${interpolateExpression(condition, values)}`.match(/(^!?)(.+$)?/) || [];

  if (result === 'true') {
    return invert ? false : true;
  }
  if (result === 'false' || result === 'undefined') {
    return invert ? true : false;
  }

  return invert ? !result : result;
}

export function interpolate(blockConfig: any, values: any): any {
  if (typeof blockConfig === 'string') {
    return interpolateExpression(blockConfig, values);
  }
  if (Array.isArray(blockConfig)) {
    return blockConfig.map((item) => interpolate(item, values));
  }
  if (typeof blockConfig === 'object') {
    return Object.entries(blockConfig || {}).reduce((prev, [k, v]) => {
      const { [k]: ignored, ...filteredBlockConfig } = blockConfig;
      const allValues = { ...values, ...filteredBlockConfig };

      if (k === 'blocks')
        return {
          ...prev,
          blocks: v,
        };

      // Interpolate
      if (!v) {
        return {
          ...prev,
          [k]: v,
        };
      }
      if (typeof v === 'string') {
        return {
          ...prev,
          [k]: interpolateExpression(v, allValues),
        };
      }
      if (typeof v === 'object') {
        if (Array.isArray(v)) {
          const newV = v.map((item) => interpolate(item, allValues));
          return {
            ...prev,
            [k]: equal(newV, v) ? v : newV,
          };
        }
        const newV = interpolate(v, allValues);
        return {
          ...prev,
          [k]: equal(newV, v) ? v : newV,
        };
      }

      return {
        ...prev,
        [k]: v,
      };
    }, {});
  }
  return blockConfig;
}

export function repeatBlocks(
  block: any,
  repeat: Repeat | undefined,
  values: any
) {
  if (!repeat) return [block];
  const { on: _on = '', as = 'item' } = repeat;
  const [, on = ''] = `${_on}`.match(/^{{(.+)}}$/) || [];
  if (!on) return [];
  const items = jsonpath.value(values, on);

  if (!Array.isArray(items)) return [];

  return items.map((item, $index) => {
    const itemValues = { [as]: item, $index };
    return {
      ...interpolate(block, { ...values, ...itemValues }),
      ...itemValues,
    };
  });
}

export function computeBlocks({ blocks, ...config }: Config, values: any) {
  const blocksValue =
    typeof blocks === 'string' ? interpolate(blocks, values) : blocks;
  return {
    ...interpolate(config, values),
    blocks:
      blocksValue && Array.isArray(blocksValue)
        ? blocksValue
            .filter((block) => {
              const { [TEMPLATE_IF]: _if } = block || {};
              return testCondition(_if, { ...values, ...config });
            })
            .flatMap((b) => {
              const {
                [TEMPLATE_IF]: _if,
                [TEMPLATE_REPEAT]: repeat,
                ...block
              } = b || {};
              return repeatBlocks(block, repeat, {
                ...values,
                ...config,
              });
            })
        : undefined,
  };
}
