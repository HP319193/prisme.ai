import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';
import DateExpression from './DateExpression';
import get from 'lodash/get';
import URLSearchParamsExpression from './URLSearchParamsExpression';

const mathFloorRoundCeil = (
  number: number,
  decimal: number,
  method: Function
) => {
  if (typeof number !== 'number' || typeof decimal !== 'number') {
    throw new InvalidExpressionSyntax(
      `Invalid parameters ${number} and ${decimal} given to round/floor/ceil function`
    );
  }
  const decimalCoef = Math.pow(10, decimal);
  return method(number * decimalCoef) / decimalCoef;
};

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
      case 'URLSearchParams':
        return new URLSearchParamsExpression(functionPayload).evaluate(context);
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
      case 'round':
        return mathFloorRoundCeil(
          functionArgs[0],
          functionArgs[1] || 0,
          Math.round
        );
      case 'floor':
        return mathFloorRoundCeil(
          functionArgs[0],
          functionArgs[1] || 0,
          Math.floor
        );
      case 'ceil':
        return mathFloorRoundCeil(
          functionArgs[0],
          functionArgs[1] || 0,
          Math.ceil
        );

      case 'split':
        const [stringToSplit, separator] = functionArgs;
        if (
          typeof separator !== 'string' ||
          typeof stringToSplit !== 'string'
        ) {
          throw new InvalidExpressionSyntax(
            `Bad split() arguments. Ex usage : split({{textVar}}, ",")`
          );
        }
        return stringToSplit.split(separator);

      case 'join':
        const [listToJoin, joiner] = functionArgs;
        if (typeof joiner !== 'string' || !Array.isArray(listToJoin)) {
          throw new InvalidExpressionSyntax(
            `Bad join() arguments. Ex usage : join({{someList}}, ",")`
          );
        }
        return listToJoin.join(joiner);

      case 'json':
        const [jsonOrObject] = functionArgs;
        if (typeof jsonOrObject === 'string') {
          try {
            return JSON.parse(jsonOrObject);
          } catch {
            throw new InvalidExpressionSyntax('Invalid JSON syntax', {
              json: jsonOrObject,
            });
          }
        } else {
          try {
            return JSON.stringify(jsonOrObject);
          } catch (err) {
            throw new InvalidExpressionSyntax('Cant stringify this object', {
              err,
            });
          }
        }

      case 'replace':
        const [input, pattern, replaceWith] = functionArgs;
        if (
          typeof input !== 'string' ||
          typeof pattern !== 'string' ||
          typeof replaceWith !== 'string'
        ) {
          throw new InvalidExpressionSyntax(
            `Bad replace() arguments. Ex usage : replace("hello world", "world", "you")`
          );
        }
        return input.replace(pattern, replaceWith);

      case 'slice':
        const [inputArr, start, end] = functionArgs;
        if (
          (!Array.isArray(inputArr) && typeof inputArr !== 'string') ||
          typeof start !== 'number' ||
          (typeof end !== 'undefined' && typeof end !== 'number')
        ) {
          throw new InvalidExpressionSyntax(
            `Bad slice() arguments. Ex usage : slice({{someArrayOrString}}, 0, 5) or slice({{someArrayOrString}}, 5)`
          );
        }
        return inputArr.slice(start, end);

      default:
        throw new InvalidExpressionSyntax(
          `Unknown function '${this.functionName}' in an expression or condition'`
        );
    }
  }
}

export default FunctionCall;
