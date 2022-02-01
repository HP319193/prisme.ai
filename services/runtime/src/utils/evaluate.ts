import { evaluate as angelEval } from "../../deps/condition-eval";

export const evaluate = (expression: string, scope: any = null) => {
  /*
   * This function is used to evaluate a math expression
   * It is used to evaluate conditions
   * We do not use the scope of mathjs as variables should already be defined and interpolated (see interpolate.ts)
   */
  return angelEval(expression, scope, true); // Use angel-eval fork
};
