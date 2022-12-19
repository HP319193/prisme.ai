import { ArrowHeadType, Edge, Elements, Node } from 'react-flow-renderer';

export class Flow {
  static BLOCK_HEIGHT = 200;
  static BLOCK_WIDTH = 300;
  static BLOCK_EMPTY = 'empty block';
  static NEW_CONDITION = 'Add condition';
  static NEW_ALL = 'new all';
  static CONDITIONS = 'conditions';
  static REPEAT = 'repeat';
  static ALL = 'all';

  private value: Prismeai.Automation;
  private nodes: Node[] = [];
  private edges: Edge[] = [];

  constructor(value: Prismeai.Automation) {
    this.value = value;
  }

  buildConditions({
    conditions,
    parent,
    parentId,
    startAt,
  }: {
    conditions: Prismeai.Conditions;
    parent: { conditions: Prismeai.Conditions };
    parentId: string;
    startAt: { x: number; y: number };
  }) {
    const nodes: Node[][] = [];
    const keys = [...Object.keys(conditions || []), Flow.NEW_CONDITION];

    // Build path for each condition
    keys.forEach((key, k) => {
      const id = `${parentId}.${k}`;
      const position = {
        ...startAt,
        x: Flow.BLOCK_WIDTH * (k + 1) + startAt.x,
        y: Flow.BLOCK_HEIGHT + startAt.y,
      };
      if (key !== Flow.NEW_CONDITION) {
        parent.conditions[key] = parent.conditions[key] || [];
      }
      // Build condition nodes
      if (
        key === Flow.NEW_CONDITION ||
        !conditions[key] ||
        conditions[key].length === 0
      ) {
        const emptyNode = {
          id: `${id}.0`,
          type: 'empty',
          data: {
            withButton: key !== Flow.NEW_CONDITION,
            parent: parent.conditions && parent.conditions[key],
            key,
          },
          position: {
            ...position,
            y: Flow.BLOCK_HEIGHT + position.y,
          },
        };
        nodes[k] = [emptyNode];
        this.nodes.push(emptyNode);
      } else {
        nodes[k] = this.buildInstructions({
          instructions: conditions[key],
          parentId: id,
          startAt: position,
        });
      }

      const conditionEdge: Edge = {
        id: `edge-${parentId}-${id}.0`,
        source: parentId,
        target: `${id}.0`,
        data: {
          label: key,
          parent: key === 'default' ? undefined : parent,
          key: key !== Flow.NEW_CONDITION ? key : '',
        },
        type: 'conditionEdge',
        sourceHandle: key,
        arrowHeadType: ArrowHeadType.Arrow,
        style: { stroke: '#015DFF' },
      };
      this.edges.push(conditionEdge);
    });

    return nodes;
  }

  buildInstructions({
    instructions,
    parentId,
    startAt,
  }: {
    instructions: Prismeai.InstructionList;
    parentId: string;
    startAt: { x: number; y: number };
  }) {
    let prevNode: Node | null;
    let position = startAt;

    if (!Array.isArray(instructions)) return [];

    const newNodes = [
      { instruction: { [Flow.BLOCK_EMPTY]: null }, index: 0 },
      ...instructions.reduce<
        { instruction: Prismeai.Instruction; index: number }[]
      >((prev, instruction, index) => {
        return [
          ...prev,
          { instruction, index },
          { instruction: { [Flow.BLOCK_EMPTY]: null }, index: index + 1 },
        ];
      }, []),
    ].map(({ index, instruction }, k) => {
      const name = Object.keys(instruction)[0];
      const value = instruction[name as keyof typeof instruction]!;
      const id = `${parentId}.${k}`;
      position = {
        ...position,
        y:
          position.y +
          (name === Flow.BLOCK_EMPTY
            ? Flow.BLOCK_HEIGHT / 1.5
            : Flow.BLOCK_HEIGHT / 2),
      };

      const node: Node = {
        id,
        type: name === Flow.BLOCK_EMPTY ? 'empty' : 'instruction',
        data: {
          label: name,
          value,
          parent: instructions,
          index,
          withButton: true,
        },
        position,
      };
      this.nodes.push(node);

      if (prevNode) {
        const edge: Edge = {
          id: `edge-${prevNode.id}-${id}`,
          source: prevNode.id,
          target: id,
          type: 'edge',
          data: {
            parent: instructions,
            index,
          },
          arrowHeadType: ArrowHeadType.Arrow,
          style: { stroke: '#015DFF' },
        };
        this.edges.push(edge);
      }

      prevNode = node;

      if (name === Flow.CONDITIONS) {
        prevNode = null;
        node.type = Flow.CONDITIONS;
        const nodes = this.buildConditions({
          conditions: value,
          parent: instruction as { conditions: Prismeai.Conditions },
          parentId: node.id,
          startAt: {
            ...position,
            y: position.y - Flow.BLOCK_HEIGHT,
          },
        });
        nodes.forEach((list) => {
          const lastNode = list[list.length - 1];
          if (!lastNode) return;
          position = {
            ...position,
            y: Math.max(position.y, lastNode.position.y),
          };

          const edge = {
            id: `edge-${parentId}.${k + 1}-${lastNode.id}`,
            source: `${lastNode.id}`,
            target: `${parentId}.${k + 1}`,
            type: 'conditionEdge',
            arrowHeadType: ArrowHeadType.Arrow,
            style: { stroke: '#015DFF' },
          };
          this.edges.push(edge);
        });
      }

      if (name === Flow.REPEAT) {
        prevNode = null;
        node.type = Flow.REPEAT;
        const valueRepeat = value as Prismeai.Repeat['repeat'];
        if (!valueRepeat.do) {
          valueRepeat.do = [];
        }
        const instructions = (valueRepeat as Prismeai.Repeat['repeat']).do;

        const nodes = this.buildInstructions({
          instructions,
          parentId: node.id,
          startAt: {
            ...position,
            x: position.x + Flow.BLOCK_WIDTH,
          },
        });
        const firstNode = nodes[0];

        if (!firstNode) return node;

        const lastNode = nodes[nodes.length - 1] || { position: {} };
        position = {
          ...position,
          y: lastNode.position.y,
        };
        this.edges.push(
          {
            id: `edge-${node.id}-${firstNode.id}`,
            source: node.id,
            target: firstNode.id,
            sourceHandle: '0',
            type: 'edge',
            arrowHeadType: ArrowHeadType.Arrow,
            style: { stroke: '#015DFF' },
          },
          {
            id: `edge-${lastNode.id}-${node.id}`,
            source: lastNode.id,
            target: node.id,
            targetHandle: '2',
            type: 'edge',
            arrowHeadType: ArrowHeadType.Arrow,
            style: { stroke: '#015DFF' },
          },
          {
            id: `edge-${node.id}-${parentId}.${k + 1}`,
            source: node.id,
            target: `${parentId}.${k + 1}`,
            sourceHandle: '1',
            type: 'edge',
            arrowHeadType: ArrowHeadType.Arrow,
            style: { stroke: '#015DFF' },
          }
        );
      }

      if (name === Flow.ALL) {
        prevNode = null;
        const prevX = position.x;
        position = {
          ...position,
          y: position.y + Flow.BLOCK_HEIGHT,
        };
        const i = instruction as Prismeai.All;
        const parent = (i.all = i.all || []);
        ([
          ...(value || []),
          { [Flow.NEW_ALL]: {} },
        ] as Prismeai.All['all']).forEach((instruction, childk) => {
          const [name] = Object.keys(instruction);
          position = {
            ...position,
            x: position.x + Flow.BLOCK_WIDTH,
          };
          const child = {
            id: `${node.id}.${childk}`,
            type: name === Flow.NEW_ALL ? 'empty' : 'instruction',
            data: {
              label: name,
              value: parent,
              withButton: true,
              parent: parent,
              index: childk,
            },
            position,
          };
          this.nodes.push(child);
          this.edges.push(
            {
              id: `edge-${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'edge',
              arrowHeadType: ArrowHeadType.Arrow,
              style: { stroke: '#015DFF' },
            },
            {
              id: `edge-${child.id}-${parentId}.${k + 1}`,
              source: child.id,
              target: `${parentId}.${k + 1}`,
              type: 'edge',
              arrowHeadType: ArrowHeadType.Arrow,
              style: { stroke: '#015DFF' },
            }
          );
        });
        position = {
          ...position,
          x: prevX,
        };
      }
      return node;
    });

    return newNodes;
  }

  build() {
    const trigger = {
      id: '0',
      type: 'trigger',
      data: {
        title: 'trigger',
        trigger: true,
        value: this.value.when,
      },
      position: { x: 0, y: 0 },
    };
    this.nodes.push(trigger);

    const nodes = this.buildInstructions({
      instructions: this.value.do,
      parentId: trigger.id,
      startAt: trigger.position,
    });

    if (nodes[0]) {
      const edge: Edge = {
        id: `edge-0-${nodes[0].id}`,
        source: '0',
        target: nodes[0].id,
        data: {
          parent: this.value.do,
          index: 0,
        },
        type: 'edge',
        arrowHeadType: ArrowHeadType.Arrow,
        style: { stroke: '#015DFF' },
      };
      this.edges.push(edge);
    }
    // Add the output block
    const lastNode = this.nodes[this.nodes.length - 1];
    this.nodes.push({
      id: 'output',
      type: 'outputValue',
      data: {
        title: 'output',
        output: true,
        value: this.value,
      },
      position: {
        ...lastNode.position,
        y: lastNode.position.y + Flow.BLOCK_HEIGHT / 2,
      },
    });
    this.edges.push({
      id: `edge-${lastNode.id}-output`,
      source: lastNode.id,
      target: 'output',
      type: 'edge',
      data: {
        parent: this.value.do,
        index: (this.value.do || []).length,
      },
      arrowHeadType: ArrowHeadType.Arrow,
      style: { stroke: '#015DFF' },
    });

    const flow = [...this.nodes, ...this.edges];

    return flow;
  }
}
export const buildFlow = (value: Prismeai.Automation): Elements => {
  const flow = new Flow(value);
  return flow.build();
};
