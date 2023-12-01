type Value = Record<string, any>;

interface Next extends Value {
  $merge?: Value;
}

export function merge(value: Value, _with: Value) {
  if (typeof _with !== 'object' || Array.isArray(_with)) return value;
  let newValue = { ...value };
  Object.entries(_with).forEach(([k, v]) => {
    switch (typeof v) {
      case 'object':
        if (Array.isArray(v)) {
          newValue[k] = [...value[k], ...v];
        } else {
          newValue[k] = { ...value[k], ...v };
        }
        break;
      case 'string':
        newValue[k] = `${newValue[k]}${v}`;
        break;
      case 'number':
        newValue[k] = +newValue[k] + v;
        break;
      case 'boolean':
        newValue[k] = !!newValue[k] && v;
        break;
      default:
        newValue[k] = v;
    }
  });
  return newValue;
}

export function applyCommands(prev: any, { $merge, ...next }: Next) {
  let value = { ...prev, ...next };
  if ($merge) {
    value = merge(value, $merge);
  }
  return value;
}
