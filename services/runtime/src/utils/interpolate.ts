'use strict';

import { parseVariableName } from './parseVariableName';

const getValueFromCtx = (pathStr: string, context: any) => {
  const path = parseVariableName(pathStr);
  return path.reduce((prev: any, nextPath: any) => {
    return typeof prev === 'object' && typeof prev[nextPath] !== 'undefined'
      ? prev[nextPath]
      : undefined;
  }, context);
};

const evaluate = (expr: any, ctx: any, { asString = false } = {}) => {
  const value = getValueFromCtx(expr, ctx);
  if (typeof value !== 'string') {
    if (asString) {
      return typeof value === 'undefined' || value == null
        ? ''
        : JSON.stringify(value, null, '  ');
    }
    return value;
  }

  return value;
};

export const interpolate = (
  target: any,
  context = {},
  exclude: string[] = [],
  pattern = /\{\{([^{}]*?)\}\}/g
): any => {
  if (!context) {
    context = {};
  }
  if (typeof target === 'string') {
    try {
      // First replace nested variables
      let replaceAgain = true;
      do {
        replaceAgain = false;
        target = target.replace(
          pattern,
          (_: any, expr: any, index: number, fullStr: string) => {
            // Do not replace the last & full string variable as it would break objects into "[object Object]"
            if (index == 0 && expr.length + 4 === fullStr.length) {
              // Stringify only if current substr does not span the whole string)
              return fullStr;
            }
            replaceAgain = true;
            return evaluate(expr, context, {
              asString: true,
            });
          }
        );
      } while (replaceAgain);
      // If remaining variable name spans the whole string, we can return the variable itself as it is
      if (target.startsWith('{{') && target.endsWith('}}')) {
        return evaluate(target.substring(2, target.length - 2), context);
      }
      return target;
    } catch (e) {
      throw new Error(`Could not interpolate string "${target}": ${e}`);
    }
  } else if (Array.isArray(target)) {
    return target.map((value: any) =>
      interpolate(value, context, exclude, pattern)
    );
  } else if (target && typeof target === 'object') {
    return Object.entries(target).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: exclude.includes(key)
          ? value
          : interpolate(value, context, exclude, pattern),
      }),
      {}
    );
  }
  return target;
};
