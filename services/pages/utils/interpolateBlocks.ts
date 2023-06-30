import jsonpath from 'jsonpath';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

const IF = 'template.if';
const REPEAT = 'template.repeat';

function getInterpolateKey(value: any) {
  const [, m = ''] =
    (typeof value === 'string' && value.match(/\{\{(.+)\}\}/)) || [];
  return m.split(/\|/);
}

function pipe(value: any, formatter: any, data: any) {
  if (!formatter) return value;

  function replaceInAttribute(name = '') {
    const [, , _static] = name.match(/(\"|\')(.+)(\'|\")/) || [];
    if (_static) return _static;
    return jsonpath.value(data, name) || name;
  }

  const [fn, args = ''] = formatter.split(/\:/);

  switch (fn) {
    case 'date':
      const [dateFormat = '', lang = 'en'] = args.split(/,/);

      return dayjs(value)
        .locale(replaceInAttribute(`${lang}`.trim()))
        .format(replaceInAttribute(`${dateFormat}`.trim()));
    case 'if':
      const [a, b] = args.split(/,/);
      return value ? a : b;
    default:
      return value;
  }
}

function replaceString(value: any, data: any) {
  const matches = value.match(/\{\{.+?\}\}/g);

  if (matches && matches.length) {
    matches.forEach((m: any) => {
      const [toInterpolate, formatter] = getInterpolateKey(m);
      const newVal = jsonpath.value(data, toInterpolate) || '';
      if (typeof newVal === 'object' && !formatter) {
        value = newVal;
        return;
      }
      value = value.replace(m, pipe(newVal, formatter, data));
    });
  }

  return value;
}

function repeat(o: any, data: any): any {
  const { blocks, [REPEAT]: repeat, ...original } = o;

  if (!blocks || !Array.isArray(blocks)) return [];
  const len = blocks.length;

  const { on, as = 'item' } = o[REPEAT];

  if (!on) return [];

  const repeatOn = jsonpath.value(data, on);

  if (!Array.isArray(repeatOn)) return [];

  return {
    ...original,
    blocks: repeatOn.flatMap((itemData, k) => {
      return interpolate(
        { ...blocks[k % len] },
        {
          ...data,
          [as]: itemData || '',
        }
      );
    }),
  };
}

function interpolate(o: any, data: any): any {
  if (Array.isArray(o)) {
    return o.flatMap((item) => {
      if (typeof item !== 'string') {
        return interpolate(item, data);
      }
      const [toInterpolate] = getInterpolateKey(item);
      if (toInterpolate) {
        return jsonpath.value(data, toInterpolate);
      }
      return item;
    });
  }

  if (typeof o === 'object') {
    if (o[REPEAT]) {
      return repeat(o, data);
    }
    const _if = o[IF];
    if (_if && !jsonpath.value(data, _if)) {
      return [];
    }
    return Object.entries(o)
      .filter(([k]) => ![IF, REPEAT].includes(k))
      .reduce((prev, [k, v]) => {
        let value = v;

        if (typeof value === 'object') {
          value = interpolate(v, data);
        }

        if (typeof value === 'string') {
          value = replaceString(value, data);
        }

        return {
          ...prev,
          [k]: value,
        };
      }, {});
  }

  return replaceString(`${o}`, data);
}

export function interpolateBlocks(blocks: any, config: any) {
  return interpolate(blocks, config);
}

export default interpolateBlocks;
