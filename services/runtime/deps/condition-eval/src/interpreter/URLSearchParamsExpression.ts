import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';
import Variable from './Variable';

class URLSearchParamsExpression extends Evaluatable {
  querystring;
  field;

  constructor({ functionArgs, resultKey }: any) {
    super();

    const [querystring] = functionArgs;
    this.querystring = querystring;
    this.field = resultKey;
  }

  evaluate(context: any) {
    try {
      const querystring =
        this.querystring instanceof Variable
          ? this.querystring.evaluate(context)
          : this.querystring;

      switch (this.field) {
        case 'asString':
          return new URLSearchParams(querystring).toString();
        case 'asJSON':
          if (typeof querystring === 'string') {
            const params = new URLSearchParams(querystring) as any;
            return Object.fromEntries(params.entries());
          } else {
            throw new InvalidExpressionSyntax(
              `URLSearchParam.asJSON requires a string input`
            );
          }
        default:
          throw new InvalidExpressionSyntax(
            `Unsupported URLSearchParam(...) field ${this.field}`
          );
      }
    } catch {
      return undefined;
    }
  }
}

export default URLSearchParamsExpression;
