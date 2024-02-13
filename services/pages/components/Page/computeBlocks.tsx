import jsonpath from 'jsonpath';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import equal from 'fast-deep-equal';
import sift from 'sift';

import('dayjs/locale/en');
import('dayjs/locale/fr');

dayjs.extend(LocalizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('fr', {
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    s: 'quelques secondes',
    m: 'une minute',
    mm: '%d minutes',
    h: 'une heure',
    hh: '%d heures',
    d: 'un jour',
    dd: '%d jours',
    M: 'un mois',
    MM: '%d mois',
    y: 'un an',
    yy: '%d ans',
  },
});

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

export const original = Symbol('original');
export const $index = Symbol('$index');

interface Config {
  blocks?: TemplatedBlock[] | string;
  [k: string]: any;
}
export const cleanAttribute = (values: any) => (attribute: string) => {
  const trimed = attribute.trim();

  if (trimed !== '' && typeof +trimed === 'number' && !Number.isNaN(+trimed)) {
    return +trimed;
  }
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
  switch (fn.trim()) {
    case 'date': {
      const [format = '', lang = 'en', fallback = ''] = attrs
        .split(/,/)
        .map(cleanAttribute(values));
      const date = dayjs(value);
      return Number.isNaN(+date) ? fallback : date.locale(lang).format(format);
    }
    case 'from-now': {
      const [lang = 'en'] = attrs.split(/,/).map(cleanAttribute(values));
      return dayjs(value).locale(lang).fromNow();
    }
    case 'if': {
      const [True, False] = attrs.split(/,/).map(cleanAttribute(values));
      return value ? True : False;
    }
    case 'formatNumber': {
      const [lang, maximumFractionDigits] = attrs
        .split(/,/)
        .map(cleanAttribute(values));
      return new Intl.NumberFormat(lang, { maximumFractionDigits }).format(
        +value
      );
    }
    case 'filter':
      if (!Array.isArray(value)) return value;
      const [filtersVarName] = attrs.split(/,/);
      const filters = values[filtersVarName || 'filters'];
      console.log(filtersVarName, filters, values);
      if (!filters) return value;
      return value.filter(sift(filters));
    default:
      return value;
  }
}

export function interpolateExpression(expression: string, values: any) {
  let newValue = expression;
  // Unique value, can be casted
  const uniqueMatch = `${expression}`.match(/^{{[^}]+}}$/);

  const matches = expression.match(/{{[^}]+}}/g);

  matches?.forEach((match) => {
    const [, expr] = match.match(/{{([^}]+)}}/) || [];
    const [_key, ...filters] = expr.split(/\|/);
    const key = _key.trim();

    let interpolation = '';
    try {
      interpolation =
        key === '$index' ? values[$index] : jsonpath.value(values, key);
      if (typeof interpolation === 'string') {
        interpolation = interpolateExpression(interpolation, values);
      }
    } catch (e) {}
    if (filters) {
      interpolation = filters
        .filter(Boolean)
        .reduce(
          (prev, filter) => applyFilter(filter, prev, values),
          interpolation
        );
    }
    if ((interpolation && typeof interpolation === 'object') || uniqueMatch) {
      newValue = interpolation;
      return;
    }

    newValue =
      typeof newValue === 'string'
        ? newValue.replace(
            match,
            interpolation === undefined ? '' : interpolation
          )
        : newValue;
  });

  return newValue;
}

export function testCondition(condition: string = '', values: any) {
  if (!condition) return true;
  const interpolated = interpolateExpression(condition, values);
  const [, invert, result] =
    typeof interpolated === 'string'
      ? interpolated.match(/(^!?)(.+$)?/m) || []
      : [, condition.match(/^!/), interpolated];

  if (result === 'true') {
    return invert ? false : true;
  }
  if (result === 'false' || result === 'undefined') {
    return invert ? true : false;
  }

  return invert ? !result : result;
}

export function repeatBlock(block: Config, values: any) {
  const { [TEMPLATE_REPEAT]: repeat, ...originalBlock } = block;
  const _if = block[TEMPLATE_IF];
  const { on: _on = '', as = 'item' } = repeat || {};
  const [, on = ''] = `${_on}`.match(/^{{(.+)}}$/) || [];

  if (!on) return [];
  const items = jsonpath.value(values, on);
  if (!Array.isArray(items)) return [];

  return items.flatMap((item, index) => {
    const ret = {
      ...originalBlock,
      [as]: item,
      [$index]: index,
    };
    if (_if && !testCondition(_if, ret)) return [];
    return [ret];
  });
}

export function interpolateValue(value: any, values: any): any {
  if (!value) return value;

  if (Array.isArray(value)) {
    const output = value.flatMap((v) => {
      if (!v) return v;
      const hidden =
        !v[TEMPLATE_REPEAT] &&
        v[TEMPLATE_IF] &&
        !testCondition(v[TEMPLATE_IF], values);
      const blocks = v[TEMPLATE_REPEAT] ? repeatBlock(v, values) : [v];
      return blocks.map((v) => {
        if (v.slug) {
          if (hidden) {
            return { ...v, hidden };
          }
          const newValue = { ...v };
          delete newValue.hidden;
          return newValue;
        }
        const interpolated = interpolateValue(v, values);
        if (
          hidden &&
          typeof interpolated === 'object' &&
          !Array.isArray(interpolated)
        ) {
          return { ...interpolated, hidden };
        }
        return interpolated;
      });
    });
    if (equal(value, output)) return value;
    return output;
  }
  if (typeof value === 'object') {
    const hidden =
      value[TEMPLATE_IF] && !testCondition(value[TEMPLATE_IF], values);
    let output = value.slug ? value : computeBlock(value, values);
    if (hidden && typeof output === 'object' && !Array.isArray(output)) {
      output = { ...output, hidden };
    }
    if (equal(value, output)) return value;
    return output;
  }
  if (typeof value === 'string') {
    return interpolateExpression(value, values);
  }
  return value;
}

export function computeBlock(
  block: TemplatedBlock,
  values: any,
  overrideOriginal: boolean = false
): Record<string, any> & { [original]: any } {
  const originalConfig = overrideOriginal
    ? block
    : Object.getOwnPropertyDescriptor(block, original)?.value || block;
  const { [TEMPLATE_IF]: _if, ...blockConfig } = originalConfig;
  const { [original]: ignore, ...cleanedOriginalConfig } = originalConfig;
  const computed = {
    [original]: cleanedOriginalConfig,
  };

  const ret = Object.entries(blockConfig).reduce((prev, [k, v]) => {
    const { [k]: ignored, ...filteredValues } = blockConfig;

    const allValues = {
      ...filteredValues,
      ...values,
    };

    return {
      ...prev,
      [k]: interpolateValue(v, allValues),
    };
  }, computed);
  return !testCondition(_if, values) ? { ...ret, hidden: true } : ret;
}
