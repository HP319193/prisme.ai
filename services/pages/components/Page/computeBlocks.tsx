import jsonpath from 'jsonpath';

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

export function interpolateExpression(expression: string, values: any) {
  let newValue = expression;
  const matches = expression.match(/{{[^}]+}}/g);
  matches?.forEach((match) => {
    const [, key] = match.match(/{{([^}]+)}}/) || [];
    const interpolation =
      key === '$index' ? values.$index : jsonpath.value(values, key);
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
