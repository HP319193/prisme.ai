import jsonpath from 'jsonpath';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

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
  blocks: TemplatedBlock[];
  [k: string]: any;
}
export const cleanAttribute = (values: any) => (attribute: string) => {
  const trimed = attribute.trim();
  if (trimed.match(/^'.+'$/) || trimed.match(/^".+"$/)) {
    return trimed.substring(1, trimed.length - 1);
  }

  return jsonpath.value(values, trimed);
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
  if (result === 'false') {
    return invert ? true : false;
  }

  return invert ? !result : result;
}

export function interpolate(blockConfig: any, values: any): any {
  if (typeof blockConfig === 'string') {
    return interpolateExpression(blockConfig, values);
  }
  return Object.entries(blockConfig || {}).reduce((prev, [k, v]) => {
    if (k === 'blocks')
      return {
        ...prev,
        blocks: v,
      };

    // Interpolate
    if (typeof v === 'string') {
      return {
        ...prev,
        [k]: interpolateExpression(v, values),
      };
    }
    if (typeof v === 'object') {
      if (Array.isArray(v)) {
        return {
          ...prev,
          [k]: v.map((item) => interpolate(item, values)),
        };
      }
      return {
        ...prev,
        [k]: interpolate(v, values),
      };
    }

    return {
      ...prev,
      [k]: v,
    };
  }, {});
}

export function repeatBlocks(
  block: any,
  repeat: Repeat | undefined,
  values: any
) {
  if (!repeat) return [block];
  const { on: _on = '', as = 'item' } = repeat;
  const [, on = ''] = _on.match(/^{{(.+)}}$/) || [];
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
  return {
    ...interpolate(config, { ...values, ...config }),
    blocks:
      blocks && Array.isArray(blocks)
        ? blocks
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
        : blocks,
  };
}
