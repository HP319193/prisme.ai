'use strict';

import { parseVariableName } from './parseVariableName';

const getValueFromCtx = (pathStr: string, context: any) => {
  const path = parseVariableName(pathStr);
  return path.reduce(
    (prev: any, nextPath: any) =>
      typeof prev === 'object' ? prev[nextPath] || '' : '',
    context
  );
};

const evaluate = (expr: any, ctx: any, { asString = false } = {}) => {
  const value = getValueFromCtx(expr, ctx);

  if (typeof value !== 'string') {
    return asString ? JSON.stringify(value, null, '  ') : value;
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
      const match = pattern.exec(target);
      if (pattern.lastIndex) {
        pattern.lastIndex = 0; // reset last index if there is a g flag
      }
      if (match && match[0].length === target.length) {
        return evaluate(match[1], context); // meaning the match is the whole string, thus we can return the actual value
      }
      // Keep matching pattern until noting is matched in order to interpolate deepest vars first (nested variables)
      let replaceAgain = false;
      do {
        replaceAgain = false;
        target = target.replace(pattern, (_: any, expr: any) => {
          replaceAgain = true;
          return evaluate(expr, context, { asString: true });
        });
      } while (replaceAgain);
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
