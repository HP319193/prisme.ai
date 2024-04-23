import _get from 'lodash/get';
import _set from 'lodash/set';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';

type Value = Record<string, any>;

interface Next extends Value {
  $merge?: Value;
}

export function merge(value: Value, _with: Value) {
  if (typeof _with !== 'object' || Array.isArray(_with)) return value;
  let newValue = { ...value };
  Object.entries(_with).forEach(([path, v]) => {
    const _v = typeof value === 'object' ? _get(value, path) : value;

    switch (typeof _v) {
      case 'object':
        if (Array.isArray(_v)) {
          if (!Array.isArray(v)) break;
          newValue = _set(newValue, path, [..._v, ...v]);
        } else {
          newValue = _set(newValue, path, { ..._v, ...v });
        }
        break;
      case 'string':
        newValue = _set(newValue, path, `${_v}${v}`);
        break;
      case 'number':
        newValue = _set(newValue, path, _v + v);
        break;
      case 'boolean':
        newValue = _set(newValue, path, !!_v && v);
        break;
      default:
        newValue = _set(newValue, path, v);
    }
  });

  return newValue;
}

export function replace(value: Value, _with: Value) {
  if (typeof _with !== 'object' || Array.isArray(_with)) return value;
  let newValue = { ...value };
  Object.entries(_with).forEach(([path, v]) => {
    newValue = _set(newValue, path, v);
  });
  return newValue;
}

export function remove(value: Value, _with: Value) {
  if (typeof _with !== 'object' || Array.isArray(_with)) return value;
  let newValue = { ...value };
  Object.entries(_with).forEach(([path, v]) => {
    const _v = _get(newValue, path);
    if (!Array.isArray(_v)) return;
    newValue = _set(
      newValue,
      path,
      _v.filter(
        (item: any) =>
          !Object.entries(v).every(([k, v]) =>
            Array.isArray(v) ? v.includes(item[k]) : item[k] === v
          )
      )
    );
  });
  return newValue;
}

export function applyCommands(
  prev: any,
  { $merge, $replace, $remove, ...next }: Next
) {
  let value = _cloneDeep({ ...prev, ...next });
  if ($merge) {
    value = merge(value, $merge);
  }
  if ($replace) {
    value = replace(value, $replace);
  }
  if ($remove) {
    value = remove(value, $remove);
  }
  return value;
}
