import Evaluatable from '../Evaluatable';
import { evaluateNode } from '../utils';

class NegationExpression extends Evaluatable {
  node;
  constructor(node: any) {
    super();

    this.node = node;
  }

  evaluate(context: any) {
    const result = !evaluateNode(this.node, context);
    return result;
  }
}

export default NegationExpression;
