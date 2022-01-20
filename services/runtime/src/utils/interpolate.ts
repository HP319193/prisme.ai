"use strict";

const getValueFromCtx = (pathStr: string, context: any) => {
  const path = pathStr.split(/\./);
  return path.reduce(
    (prev: any, nextPath: any) =>
      typeof prev === "object" ? prev[nextPath] || "" : "",
    context
  );
};

const evaluate = (expr: any, ctx: any, { asString = false } = {}) => {
  const value = getValueFromCtx(expr, ctx);

  if (typeof value !== "string") {
    return asString ? JSON.stringify(value, null, "  ") : value;
  }

  return value;
};

export const interpolate = (
  target: any,
  context = {},
  pattern = /\{\{(.*?[^\\]+?)\}\}/g
): any => {
  if (!context) {
    context = {};
  }
  if (typeof target === "string") {
    try {
      const match = pattern.exec(target);
      if (pattern.lastIndex) {
        pattern.lastIndex = 0; // reset last index if there is a g flag
      }
      if (match && match[0].length === target.length) {
        return evaluate(match[1], context); // meaning the match is the whole string, thus we can return the actual value
      }
      return target.replace(pattern, (_, expr) =>
        evaluate(expr, context, { asString: true })
      );
    } catch (e) {
      throw new Error(`Could not interpolate string "${target}": ${e}`);
    }
  } else if (Array.isArray(target)) {
    return target.map((value: any) => interpolate(value, context, pattern));
  } else if (target && typeof target === "object") {
    return Object.entries(target).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: interpolate(value, context, pattern),
      }),
      {}
    );
  }
  return target;
};
