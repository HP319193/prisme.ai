import { evaluate as angelEval } from '../../deps/condition-eval';
import { InvalidExpressionSyntax } from '../errors';

export const evaluate = (
  expression: string,
  scope: any = null,
  strictBoolean = true
) => {
  /*
   * This function is used to evaluate a math expression
   * It is used to evaluate conditions
   * We do not use the scope of mathjs as variables should already be defined and interpolated (see interpolate.ts)
   */
  try {
    const result = angelEval(expression, scope, strictBoolean); // Use angel-eval fork
    return result;
  } catch (e: any) {
    if (!(e instanceof InvalidExpressionSyntax)) {
      throw new InvalidExpressionSyntax(e.message, { expression });
    }
    throw e;
  }
};
