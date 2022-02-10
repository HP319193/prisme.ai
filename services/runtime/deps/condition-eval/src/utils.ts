import Evaluatable from './Evaluatable';

export function evaluateNode(node: any, context: any): any {
  if (node instanceof Evaluatable) {
    return node.evaluate(context);
  }

  if (Array.isArray(node)) {
    return node.map((n: any) => evaluateNode(n, context)).flat();
  }

  return node;
}

export default {
  evaluateNode,
};
