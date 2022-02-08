import Evaluatable from '../Evaluatable';
import { evaluateNode } from '../utils';

const handleMatches = (left: any, right: any) => {
  if (`${right}`.startsWith('regex(')) {
    const regex = `${right}`.replace('regex(', '').replace(/\)$/, '');
    return `${left}`.match(new RegExp(regex));
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

    switch (`${this.operator}`.toLowerCase()) {
      case 'matches':
        return !!handleMatches(left, right);

      case 'not matches':
        return !handleMatches(left, right);

      case 'exists':
        return left !== undefined && left !== null;

      case 'not exists':
        return left === undefined || left === null;

      case 'equals':
      case '==':
      case '===':
        return left === right;
      case 'not equals':
      case '!=':
      case '!==':
        return left !== right;

      case '<=':
        return left <= right;

      case '<':
        return left < right;

      case '>=':
        return left >= right;

      case '>':
        return left > right;

      case 'and':
      case '&&':
        return left && right;

      case 'or':
      case '||':
        return left || right;
    }

    throw new Error(this.operator + ' not implemented');
  }
}

export default ConditionalExpression;
