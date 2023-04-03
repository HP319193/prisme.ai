import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';

class MathematicalExpression extends Evaluatable {
  leftTerm;
  rightTerm;
  op;
  constructor(params: any) {
    super();

    const { leftTerm, op, rightTerm } = params;
    this.leftTerm = leftTerm;
    this.rightTerm = rightTerm;
    this.op = op;
    console.log(JSON.stringify(params, null, 2));
  }

  evaluate(context: any) {
    const leftTerm =
      this.leftTerm instanceof Evaluatable
        ? this.leftTerm.evaluate(context)
        : this.leftTerm?.value;
    const rightTerm =
      this.rightTerm instanceof Evaluatable
        ? this.rightTerm.evaluate(context)
        : this.rightTerm?.value;

    if (!this.op) {
      return leftTerm;
    }
    switch (this.op) {
      case '+':
        return leftTerm + rightTerm;
      case '-':
        return leftTerm - rightTerm;
      case '*':
        return leftTerm * rightTerm;
      case '/':
        return leftTerm / rightTerm;
      case '%':
        return leftTerm % rightTerm;
      default:
        throw new InvalidExpressionSyntax(`Invalid operator ${this.op}`);
    }
  }
}

export default MathematicalExpression;
