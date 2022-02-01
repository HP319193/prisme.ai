import Evaluatable from "../Evaluatable";
import { evaluateNode } from "../utils";

class NegationExpression extends Evaluatable {
  node;
  constructor(node: any) {
    super();

    this.node = node;
  }

  evaluate(context: any) {
    return !evaluateNode(this.node, context);
  }
}

export default NegationExpression;
