'use strict';

import { parseVariableName } from './parseVariableName';
import { evaluate as evaluateExpr } from './evaluate';
import { PrismeError } from '../errors';

const getValueFromCtx = (pathStr: string, context: any) => {
  const path = parseVariableName(pathStr);
  return path.reduce((prev: any, nextPath: any) => {
    return typeof prev?.[nextPath] !== 'undefined' ? prev[nextPath] : undefined;
  }, context);
};

const evaluate = (
  expr: any,
  ctx: any,
  options: { evalExpr?: boolean; asString?: boolean }
) => {
  const { asString = false, evalExpr = false } = options;
  const value = evalExpr
    ? evaluateExpr(expr, ctx, false)
    : getValueFromCtx(expr, ctx);
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
  pattern = /\{\{([^{}]*?)\}\}|\{\%([^{}]*?)\%\}/g
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
          (
            fullMatch: any,
            varExpr: any,
            evalExpr: any,
            index: number,
            fullStr: string
          ) => {
            // Do not replace the last & full string variable as it would break objects into "[object Object]"
            if (index == 0 && fullMatch.length === fullStr.length) {
              return fullStr;
            }
            replaceAgain = true;
            return evaluate(varExpr || evalExpr, context, {
              asString: true,
              evalExpr: !!evalExpr,
            });
          }
        );
      } while (replaceAgain);
      // If remaining variable name spans the whole string, we can return the variable itself as it is
      if (
        (target.startsWith('{{') && target.endsWith('}}')) ||
        (target.startsWith('{%') && target.endsWith('%}'))
      ) {
        return evaluate(target.substring(2, target.length - 2), context, {
          evalExpr: target.startsWith('{%'),
        });
      }
      return target;
    } catch (e) {
      if (e instanceof PrismeError) {
        throw e;
      }
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
