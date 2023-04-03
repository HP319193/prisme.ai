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
      default:
        throw new InvalidExpressionSyntax(
          `Unknown function '${this.functionName} in an expression or condition'`
        );
    }
  }
}

export default FunctionCall;
