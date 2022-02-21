class Evaluatable {
  /**
   * Evaluates with the given context.
   *
   * @param {{ [key: string]: any }} [context]
   */
  evaluate(context: any) {
    throw new Error('the evaluate method needs to be implemented');
  }
}

export default Evaluatable;
