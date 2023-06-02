'use strict';

import { logger } from '../logger';
import { extractObjectsByPath } from './extractObjectsByPath';

export interface InterpolateOptions {
  undefinedVars?: 'leave' | 'remove';
}

const evaluate = (
  exprWithBrackets: any,
  ctx: any,
  options: InterpolateOptions & { asString?: boolean } = {}
) => {
  const { asString = false, undefinedVars = 'remove' } = options;

  const expr = exprWithBrackets.slice(2, -2);

  const value = extractObjectsByPath(ctx, expr)?.[0]?.value;

  if (typeof value === 'undefined' && undefinedVars === 'leave') {
    return exprWithBrackets;
  } else if (typeof value !== 'string') {
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
  opts: InterpolateOptions = {},
  pattern = /(\{\{[^{}]*?\}\})/g
): any => {
  if (!context) {
    context = {};
  }
  if (typeof target === 'string' && target.includes('{')) {
    try {
      // First replace nested variables
      let replaceAgain = true;
      do {
        replaceAgain = false;
        target = target.replace(
          pattern,
          (fullMatch: any, expr: any, index: number, fullStr: string) => {
            // Do not replace the last & full string variable as it would break objects into "[object Object]"
            if (index == 0 && fullMatch.length === fullStr.length) {
              replaceAgain = false;
              return fullStr;
            }
            const evaluated = evaluate(expr, context, {
              ...opts,
              asString: true,
            });
            // The only reason for which evaluate might return a "{{expression}}"" again is that var is undefined & opts.undefinedVars == 'leave'
            // Without setting replaceAgain to false in that case, it would end in an infinite loop !!
            replaceAgain =
              !evaluated.startsWith('{{') || opts.undefinedVars !== 'leave';
            return evaluated;
          }
        );
      } while (replaceAgain);
      // If remaining variable name spans the whole string, we can return the variable itself as it is
      if (target.startsWith('{{') && target.endsWith('}}')) {
        return evaluate(target, context, opts);
      }
    } catch (err) {
      logger.warn({ msg: `Could not interpolate string "${target}"`, err });
    }
    return target;
  } else if (Array.isArray(target)) {
    return target.map((value: any) =>
      interpolate(value, context, opts, pattern)
    );
  } else if (target && typeof target === 'object') {
    return Object.entries(target).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: interpolate(value, context, opts, pattern),
      }),
      {}
    );
  }
  return target;
};
