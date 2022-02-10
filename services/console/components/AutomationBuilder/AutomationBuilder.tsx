import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  useZoomPanHelper,
} from 'react-flow-renderer';
import { buildFlow } from './flow';
import ConditionEdge from './ConditionEdge';
import automationBuilderContext, { AutomationBuilderContext } from './context';
import Edge from './Edge';
import InstructionEdge from './InstructionEdge';
import EmptyBlock from './EmptyBlock';
import Instruction from './Instruction';
import Repeat from './Repeat';
import Trigger from './Trigger';
import Conditions from './Conditions';
import iconPrisme from '../../icons/icon-prisme.svg';
import iconWorkspace from '../../icons/icon-workspace.svg';
import Panel from './Panel';
import InstructionForm from './Panel/InstructionForm';
import ConditionForm from './Panel/ConditionForm';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { Schema } from '../SchemaForm/types';
import BUILTIN_INSTRUCTIONS from '@prisme.ai/validation/instructions.json';
import { useTranslation } from 'next-i18next';
import TriggerForm from './Panel/TriggerForm';
import { generateEndpoint } from '../../utils/urls';

interface AutomationBuilderProps {
  id?: string;
  value: Prismeai.Automation;
  onChange: (value: Prismeai.Automation) => void;
}

const nodeTypes = {
  trigger: Trigger,
  instruction: Instruction,
  conditions: Conditions,
  repeat: Repeat,
  empty: EmptyBlock,
};
const edgeTypes = {
  edge: Edge,
  instruction: InstructionEdge,
  conditionEdge: ConditionEdge,
};

export const AutomationBuilder: FC<AutomationBuilderProps> = ({
  id,
  value,
  onChange,
}) => {
  const { t } = useTranslation('workspaces');
  const zoomPanHelper = useZoomPanHelper();
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [instructionEditing, setInstructionEditing] = useState<
    | {
        instruction?: Prismeai.Instruction;
        onSubmit: (v: Prismeai.Instruction) => void;
      }
    | undefined
  >();
  const [conditionEditing, setConditionEditing] = useState<
    | {
        condition?: string;
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const [triggerEditing, setTriggerEditing] = useState<
    | {
        trigger?: Prismeai.When;
        onSubmit: (v: Prismeai.When) => void;
      }
    | undefined
  >();

  useEffect(() => {
    setTimeout(() => zoomPanHelper.fitView());
  }, [zoomPanHelper, id]);

  const {
    workspace,
    workspace: { automations = {} },
  } = useWorkspace();

  const elements = useMemo(() => {
    const flow = buildFlow(value);
    if (value.when && value.when.endpoint) {
      flow[0].data.endpoint = generateEndpoint(
        workspace.id,
        `${
          value.when.endpoint === 'true' || value.when.endpoint === true
            ? id
            : value.when.endpoint
        }`
      );
    }
    return flow;
  }, [id, value, workspace.id]);

  const instructionsSchemas: [
    string,
    Record<string, Schema & { description?: string }>,
    { icon: string }
  ][] = useMemo(
    () => [
      [
        t('automations.instruction.title_builtin'),
        Object.keys(BUILTIN_INSTRUCTIONS).reduce(
          (prev, name) => ({
            ...prev,
            [name]: (BUILTIN_INSTRUCTIONS as any)[name].properties[name],
          }),
          {}
        ),
        { icon: iconPrisme.src },
      ],
      [
        workspace.name,
        Object.keys(automations).reduce((prev, name) => {
          if (name === id) return prev;
          const schema = automations[name].arguments
            ? {
                type: 'object',
                properties: automations[name].arguments,
              }
            : {};
          return {
            ...prev,
            [name]: {
              properties: {
                [name]: schema,
              },
              description: automations[name].description,
            },
          };
        }, {}),
        { icon: iconWorkspace.src },
      ],
    ],
    [automations, id, t, workspace.name]
  );

  const hidePanel = useCallback(() => {
    setPanelIsOpen(false);
    setInstructionEditing(undefined);
    setConditionEditing(undefined);
    setTriggerEditing(undefined);
  }, []);

  const editInstructionDetails = useCallback(
    async (instruction?: Prismeai.Instruction) => {
      return new Promise<Prismeai.Instruction>((resolve) => {
        hidePanel();
        setInstructionEditing({
          instruction,
          onSubmit: (instruction: Prismeai.Instruction) => {
            resolve(instruction);
            hidePanel();
          },
        });
        setPanelIsOpen(true);
      });
    },
    [hidePanel]
  );

  const addInstruction: AutomationBuilderContext['addInstruction'] = useCallback(
    async (parent, index) => {
      if (!parent) return;
      try {
        const instruction = await editInstructionDetails();
        parent.splice(index, 0, instruction);
        onChange({ ...value });
      } catch (e) {}
    },
    [editInstructionDetails, onChange, value]
  );

  const removeInstruction: AutomationBuilderContext['removeInstruction'] = useCallback(
    (parent, index) => {
      parent.splice(index, 1);
      onChange({ ...value });
    },
    [onChange, value]
  );

  const editInstruction: AutomationBuilderContext['editInstruction'] = useCallback(
    async (parent, index) => {
      if (!parent || !parent[index]) return;
      const instruction = await editInstructionDetails(parent[index]);
      parent.splice(index, 1, instruction);
      onChange({ ...value });
    },
    [editInstructionDetails, onChange, value]
  );

  const editConditionDetails = useCallback(
    (condition: string) => {
      return new Promise<string>((resolve) => {
        hidePanel();
        setConditionEditing({
          condition,
          onSubmit: (condition: string) => {
            resolve(condition);
            hidePanel();
          },
        });
        setPanelIsOpen(true);
      });
    },
    [hidePanel]
  );

  const editCondition: AutomationBuilderContext['editCondition'] = useCallback(
    async (parent, key) => {
      try {
        const newCondition = await editConditionDetails(key);
        const { conditions = {} as Prismeai.Conditions } = parent;
        const newConditions = Array.from(
          new Set([...Object.keys(conditions), 'default'])
        )
          // Sort keys with default at the end
          .sort((a, b) => (b === 'default' ? -1 : 0))
          // make a map between key and value
          .map<[string, Prismeai.InstructionList]>((k) => [
            k === key ? newCondition : k,
            conditions[k],
          ]);
        if (!newConditions.find(([condition]) => condition === newCondition)) {
          newConditions.splice(-1, 0, [newCondition, []]);
        }
        // Build the new object
        parent.conditions = newConditions.reduce(
          (prev, [condition, list = []]) => ({
            ...prev,
            [condition]: list,
          }),
          {} as Prismeai.Conditions
        );
        onChange({ ...value });
      } catch (e) {}
    },
    [editConditionDetails, onChange, value]
  );

  const editTrigger: AutomationBuilderContext['editTrigger'] = useCallback(() => {
    hidePanel();
    setTriggerEditing({
      trigger: value.when,
      onSubmit: (when) => {
        onChange({ ...value, when });
        hidePanel();
      },
    });
    setPanelIsOpen(true);
  }, [hidePanel, onChange, value]);

  const getApp: AutomationBuilderContext['getApp'] = useCallback(
    (instruction) => {
      const [name, , { icon }] =
        instructionsSchemas.find(([, instructions]) => {
          return Object.keys(instructions).includes(instruction);
        }) || instructionsSchemas[0];
      return {
        name,
        icon,
      };
    },
    [instructionsSchemas]
  );

  const getSchema = useCallback(
    (instructionName: string) => {
      const schema = instructionsSchemas.reduce(
        (prev, [, instructions]) => instructions[instructionName] || prev,
        {} as Schema
      );
      return schema;
    },
    [instructionsSchemas]
  );

  // debug
  const [nodesDraggable, setNodesDraggable] = useState(false);

  return (
    <automationBuilderContext.Provider
      value={{
        addInstruction,
        removeInstruction,
        editInstruction,
        editCondition,
        editTrigger,
        getApp,
        instructionsSchemas,
        getSchema,
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden">
        <ReactFlow
          elements={elements}
          nodesConnectable={false}
          nodesDraggable={nodesDraggable}
          elementsSelectable
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Controls />
        </ReactFlow>
        <Panel visible={panelIsOpen} onVisibleChange={hidePanel}>
          {instructionEditing && <InstructionForm {...instructionEditing} />}
          {conditionEditing && <ConditionForm {...conditionEditing} />}
          {triggerEditing && <TriggerForm {...triggerEditing} />}
        </Panel>
      </div>
    </automationBuilderContext.Provider>
  );
};

export const ConnectedAutomationBuilder = (props: AutomationBuilderProps) => (
  <ReactFlowProvider>
    <AutomationBuilder {...props} />
  </ReactFlowProvider>
);

export default ConnectedAutomationBuilder;
