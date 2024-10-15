const whitelist = [
  'console',
  'document',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'addEventListener',
  'removeEventListener',
  'scrollY',
  'scrollX',
  'scrollTo',
  'innerWidth',
  'innerHeight',
  'Math',
  'Array',
  'Date',
  'Error',
  'Function',
  'Object',
  'RegExp',
  'String',
  'TypeError',
  'Prisme',
  'location',
];

function wrapFn(fn: Function) {
  if (fn.name.match(/^[A-Z]/)) return fn;
  return (...args: any) => fn(...args);
}

export function _getGlobals(window: Window, base: Record<string, any>) {
  const globals: Record<string, any> = whitelist.reduce((prev, k) => {
    const v = window[k as keyof typeof window];
    if (typeof v === 'function') {
      return {
        ...prev,
        [k]: wrapFn(v),
      };
    }
    if (typeof v === 'object') {
      return {
        ...prev,
        [k]: v,
      };
    }
    Object.defineProperty(prev, k, {
      get() {
        return window[k as keyof typeof window];
      },
      enumerable: true,
    });
    return prev;
  }, base);
  globals.window = globals;

  return globals;
}

export function getGlobals(window: Window, base: Record<string, any>) {
  const globals: Record<string, any> = base;
  Object.defineProperties(
    globals,
    whitelist.reduce((prev, k) => {
      const v = window[k as keyof typeof window];
      if (typeof v === 'function') {
        return {
          ...prev,
          [k]: {
            value: wrapFn(v),
            enumerable: true,
          },
        };
      }
      return {
        ...prev,
        [k]: {
          get() {
            return window[k as keyof typeof window];
          },
          enumerable: true,
        },
      };
    }, {})
  );

  globals.window = globals;

  return globals;
}

export default getGlobals;
