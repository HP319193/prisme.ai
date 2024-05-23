'use strict';

import { parseVariableName } from './parseVariableName';
import { evaluate as evaluateExpr } from './evaluate';
import { PrismeError } from '../errors';

export interface InterpolateOptions {
  exclude?: string[];
  undefinedVars?: 'leave' | 'remove';
  evalExpr?: boolean;
}

const getValueFromCtx = (pathStr: string, context: any) => {
  const path = parseVariableName(pathStr);
  return path.reduce((prev: any, nextPath: any) => {
    return typeof prev?.[nextPath] !== 'undefined' ? prev[nextPath] : undefined;
  }, context);
};

const evaluate = (
  exprWithBrackets: any,
  ctx: any,
  options: InterpolateOptions & { asString?: boolean }
) => {
  const {
    asString = false,
    evalExpr = true,
    undefinedVars = 'remove',
  } = options;

  const isExpr = exprWithBrackets.startsWith('{%');
  if (isExpr && !evalExpr) {
    return exprWithBrackets;
  }
  const expr = exprWithBrackets.slice(2, -2);

  const value = isExpr
    ? evaluateExpr(expr, ctx, false)
    : getValueFromCtx(expr, ctx);

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

function findExpressions(str: string) {
  const expressions: { startsAt: number; endsAt: number; text: string }[] = [];
  const variables: { startsAt: number; endsAt: number; text: string }[] = [];
  let openedExpression = null;
  let match;
  const pattern = /\{\%|\%\}|(\{\{[^{}]*?\}\})/g;
  while ((match = pattern.exec(str)) !== null) {
    if (match[0].startsWith('{{')) {
      if (openedExpression) {
        continue;
      }
      variables.push({
        startsAt: match.index,
        endsAt: match.index + match[0].length,
        text: match[0],
      });
      continue;
    }

    if (match[0] == '{%') {
      if (!openedExpression) {
        openedExpression = {
          index: match.index,
          nested: 0,
        };
      } else {
        openedExpression.nested++;
      }
    }

    if (match[0] == '%}') {
      if (openedExpression && openedExpression.nested === 0) {
        expressions.push({
          startsAt: openedExpression.index,
          endsAt: match.index + 2,
          text: str.slice(openedExpression.index, match.index + 2),
        });
        openedExpression = null;
      } else if (openedExpression && openedExpression.nested > 0) {
        openedExpression.nested--;
      }
    }
  }
  return { expressions, variables };
}

export const interpolate = (
  target: any,
  context = {},
  opts: InterpolateOptions = {}
): any => {
  const { exclude = [] } = opts;
  if (!context) {
    context = {};
  }
  if (typeof target === 'string' && target.includes('{')) {
    // As we do not want to stringify variables inside an {% %} expression,
    // we need to first match & evaluate these outer most expressions before
    // injecting others regular {{variables}}
    try {
      let replaceAgain = true;
      do {
        const { expressions, variables } = findExpressions(target);
        if (!expressions.length && !variables.length) {
          break;
        }
        for (let expr of expressions.concat(variables)) {
          // Do not replace the last & full string variable as it would break objects into "[object Object]"
          if (expr.startsAt === 0 && expr.text.length === target.length) {
            return evaluate(target, context, opts);
          }
          const evaluated = evaluate(expr.text, context, {
            asString: true,
            ...opts,
          });
          target = target.replace(expr.text, evaluated);

          // The only reason for which evaluate might return a "{{expression}}"" again is that var is undefined & opts.undefinedVars == 'leave'
          // Without setting replaceAgain to false in that case, it would end in an infinite loop !!
          // Also, we dont want to reprocess the result of some evalExpr (allowing to prevent some {{variable}} from being interpolated : {% '{{var}}' %})
          replaceAgain =
            (!evaluated.startsWith('{{') && !expr.text.startsWith('{%')) ||
            opts.undefinedVars !== 'leave';
        }
      } while (replaceAgain);
    } catch (e) {
      if (e instanceof PrismeError) {
        throw e;
      }
      throw new Error(`Could not interpolate string "${target}": ${e}`);
    }

    return target;
  } else if (Array.isArray(target)) {
    return target.map((value: any) => interpolate(value, context, opts));
  } else if (target && typeof target === 'object') {
    return Object.entries(target).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: exclude.includes(key)
          ? value
          : interpolate(value, context, opts),
      }),
      {}
    );
  }
  return target;
};
