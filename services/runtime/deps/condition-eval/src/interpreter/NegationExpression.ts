import Evaluatable from "../Evaluatable";
import { evaluateNode } from "../utils";

class NegationExpression extends Evaluatable {
  node;
  constructor(node) {
    super();

    this.node = node;
  }

  evaluate(context) {
    return !evaluateNode(this.node, context);
  }
}

export default NegationExpression;
