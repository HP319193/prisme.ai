import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';
import DateExpression from './DateExpression';

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
        return Array.isArray(functionArgs[0]);
      case 'isObject':
        return (
          !Array.isArray(functionArgs[0]) && typeof functionArgs[0] === 'object'
        );
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
