import Evaluatable from "./Evaluatable";

class Constant extends Evaluatable {
  value: any;
  constructor(value) {
    super();

    this.value = value;
  }

  evaluate(context) {
    return this.value;
  }
}

export default Constant;
