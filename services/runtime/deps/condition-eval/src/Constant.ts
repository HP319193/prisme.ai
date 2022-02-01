import Evaluatable from "./Evaluatable";

class Constant extends Evaluatable {
  value: any;
  constructor(value: any) {
    super();

    this.value = value;
  }

  evaluate(context: any) {
    return this.value;
  }
}

export default Constant;
