import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';
import DateExpression from './DateExpression';
import get from 'lodash/get';

class FunctionCall extends Evaluatable {
  functionName: string;
  functionArgs: any[];
  resultKey: string;

  constructor(params: any) {
    super();

    const { functionName, arguments: functionArgs, resultKey } = params;
    this.functionName = functionName;
    this.functionArgs = functionArgs || [];
    this.resultKey = resultKey;
  }

  evaluate(context: any) {
    const functionArgs = [...this.functionArgs].map((cur) =>
      cur instanceof Evaluatable ? cur.evaluate(context) : cur
    );
    const functionPayload = {
      functionArgs,
      resultKey: this.resultKey,
    };

    switch (this.functionName) {
      case 'date':
        return new DateExpression(functionPayload).evaluate(context);
      case 'isArray':
        const arrayValue =
          typeof functionArgs[0] === 'string' && functionArgs[0]
            ? get(context, functionArgs[0])
            : functionArgs[0];
        return Array.isArray(arrayValue);
      case 'isObject':
        const objectValue =
          typeof functionArgs[0] === 'string' && functionArgs[0]
            ? get(context, functionArgs[0])
            : functionArgs[0];
        return !Array.isArray(objectValue) && typeof objectValue === 'object';
      case 'rand':
        const [min = 0, max = 1] = functionArgs;
        const rand = Math.random() * (max - min) + min;
        return min === 0 && max === 1 ? rand : Math.floor(rand);

      default:
        throw new InvalidExpressionSyntax(
          `Unknown function '${this.functionName} in an expression or condition'`
        );
    }
  }
}

export default FunctionCall;
