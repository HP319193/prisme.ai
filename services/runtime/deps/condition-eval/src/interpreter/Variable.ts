import isArray from "lodash/isArray";
import get from "lodash/get";
import Evaluatable from "../Evaluatable";
import { evaluateNode } from "../utils";

class Variable extends Evaluatable {
  variableName;
  constructor(name: any) {
    super();

    this.variableName = name;
  }

  evaluateVariableName(variableName: any, context: any) {
    if (isArray(variableName)) {
      console.log(variableName);
      // we can have nested variables
      return variableName.map((n) => evaluateNode(n, context));
    }

    return variableName;
  }

  evaluate(context: any) {
    const variableName = this.evaluateVariableName(this.variableName, context);

    return get(context, variableName);
  }
}

export default Variable;
