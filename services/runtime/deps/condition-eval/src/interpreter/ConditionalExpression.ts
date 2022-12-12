import RegexParser from 'regex-parser';
import Evaluatable from '../Evaluatable';
import { evaluateNode } from '../utils';

const handleMatches = (left: any, right: any) => {
  if (Array.isArray(right)) {
    // That means we matched a regexp() expression. As it returns an array of strings instead of a string.
    return `${left}`.match(new RegExp(RegexParser(right.join(''))));
  }
  return `${left}`.match(right);
};
class ConditionalExpression extends Evaluatable {
  leftNode;
  rightNode;
  operator;
  constructor(leftNode: any, rightNode: any, operator: any) {
    super();

    this.leftNode = leftNode;
    this.rightNode = rightNode;
    this.operator = operator;
  }

  evaluate(context: any) {
    const left = evaluateNode(this.leftNode, context);
    const right = evaluateNode(this.rightNode, context);

    const operator = `${this.operator}`.toLowerCase();
    const negation = operator.startsWith('not ');
    let result: boolean;
    switch (negation ? operator.substr(4) : operator) {
      case 'matches':
        result = !!handleMatches(left, right);
        break;

      case 'in':
        try {
          const parsedRight =
            right && typeof right === 'string'
              ? right.split(',').map((cur) => {
                  if (isNaN(left) || isNaN(cur as any)) {
                    return cur;
                  }
                  return parseInt(cur);
                })
              : right;
          result = Array.isArray(parsedRight)
            ? parsedRight.includes(left)
            : left in parsedRight;
        } catch {
          result = false;
        }
        break;

      case 'exists':
        result = left !== undefined && left !== null;
        break;

      case 'equals':
      case '==':
      case '=':
        result = left == right;
        break;

      case '===':
        result = left === right;
        break;

      case '!=':
      case '!==':
        result = left !== right;
        break;

      case '<=':
        result = left <= right;
        break;

      case '<':
        result = left < right;
        break;

      case '>=':
        result = left >= right;
        break;

      case '>':
        result = left > right;
        break;

      case 'and':
      case '&&':
        result = left && right;
        break;

      case 'or':
      case '||':
        result = left || right;
        break;

      default:
        throw new Error(this.operator + ' not implemented');
    }

    return negation ? !result : result;
  }
}

export default ConditionalExpression;
