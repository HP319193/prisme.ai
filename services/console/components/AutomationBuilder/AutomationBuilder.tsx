import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  ReactFlowProvider,
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
import TriggerBlock from './TriggerBlock';
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
import OutputBlock from './OutputBlock';
import OutputForm from './Panel/OutputForm';
import useLocalizedText from '../../utils/useLocalizedText';

type InstructionSchemaTupple = [
  string,
  Record<string, Schema & { description?: string }>,
  { icon: string }
];
interface AutomationBuilderProps {
  id?: string;
  value: Prismeai.Automation;
  onChange: (value: Prismeai.Automation) => void;
  customInstructions?: {
    appName?: string;
    icon?: string;
    automations: Record<
      string,
      Pick<Prismeai.Automation, 'name' | 'description' | 'arguments'>
    >;
  }[];
}

const nodeTypes = {
  trigger: TriggerBlock,
  instruction: Instruction,
  conditions: Conditions,
  repeat: Repeat,
  empty: EmptyBlock,
  outputValue: OutputBlock,
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
  customInstructions,
}) => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();

  const zoomPanHelper = useZoomPanHelper();
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [instructionEditing, setInstructionEditing] = useState<
    | {
        instruction?: Prismeai.Instruction;
        onChange: (v: Prismeai.Instruction) => void;
        onSubmit: (v: Prismeai.Instruction) => void;
      }
    | undefined
  >();
  const [conditionEditing, setConditionEditing] = useState<
    | {
        condition?: string;
        onChange: (v: string) => void;
      }
    | undefined
  >();
  const [triggerEditing, setTriggerEditing] = useState<
    | {
        trigger?: Prismeai.When;
        onChange: (v: Prismeai.When) => void;
      }
    | undefined
  >();
  const [outputEditing, setOutputEditing] = useState<
    | {
        output?: Prismeai.Automation['output'];
        onChange: (v: { output: Prismeai.Automation['output'] }) => void;
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

  const instructionsSchemas: InstructionSchemaTupple[] = useMemo(
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
      ...[
        {
          appName: localize(workspace.name),
          automations,
          icon: iconWorkspace.src,
        },
        ...(customInstructions || []),
      ].map<InstructionSchemaTupple>(
        ({ appName = '', automations, icon = '' }) => {
          return [
            appName,
            Object.keys(automations).reduce((prev, name) => {
              if (name === id) return prev;
              const schema = { ...automations[name].arguments } || {};
              schema.output = schema.output || {
                type: 'string',
                description: t('automations.output.description'),
              };

              return {
                ...prev,
                [name]: {
                  properties: schema,
                  description: localize(automations[name].description),
                },
              };
            }, {}),
            { icon },
          ];
        }
      ),
    ],
    [automations, customInstructions, id, localize, t, workspace.name]
  );

  const hidePanel = useCallback(() => {
    setPanelIsOpen(false);
    setInstructionEditing(undefined);
    setConditionEditing(undefined);
    setTriggerEditing(undefined);
    setOutputEditing(undefined);
  }, []);

  const editInstructionDetails = useCallback(
    async (instruction: Prismeai.Instruction, onChange: any) => {
      hidePanel();
      setInstructionEditing({
        instruction,
        onChange,
        onSubmit: (instruction) => {
          onChange(instruction);
          hidePanel();
        },
      });
      setPanelIsOpen(true);
    },
    [hidePanel]
  );

  const editInstruction: AutomationBuilderContext['addInstruction'] = useCallback(
    async (parent, index = 0) => {
      if (!parent) return;
      try {
        const instruction = parent[index];
        console.log('GRARARRA', parent, index, instruction);
        if (!instruction) return;
        editInstructionDetails(
          instruction,
          (updatedInstruction: Prismeai.Instruction) => {
            parent.splice(index, 1, updatedInstruction);
            onChange({ ...value });
          }
        );
      } catch (e) {}
    },
    [editInstructionDetails, onChange, value]
  );

  const addInstruction: AutomationBuilderContext['addInstruction'] = useCallback(
    async (parent, index = 0) => {
      console.log('add', parent, index);
      if (!parent) return;
      parent.splice(index, 0, {});
      editInstruction(parent, index);
    },
    [editInstruction]
  );

  const removeInstruction: AutomationBuilderContext['removeInstruction'] = useCallback(
    (parent, index) => {
      parent.splice(index, 1);
      onChange({ ...value });
    },
    [onChange, value]
  );

  const editConditionDetails = useCallback(
    (condition: string, onChange: (condition: string) => void) => {
      hidePanel();
      setConditionEditing({
        condition,
        onChange,
      });
      setPanelIsOpen(true);
    },
    [hidePanel]
  );

  const editCondition: AutomationBuilderContext['editCondition'] = useCallback(
    async (parent, key) => {
      const originalDefault = parent.conditions.default || [];
      const original: any = Object.keys(parent.conditions)
        .filter((k) => !['default', key].includes(k))
        .reduce(
          (prev, k) => ({
            ...prev,
            [k]: parent.conditions[k],
          }),
          {}
        );
      const originalList = parent.conditions[key] || [];

      let prev = key;
      editConditionDetails(key, (newKey) => {
        if (!newKey) return;
        parent.conditions = Array.from(
          new Set([prev, ...Object.keys(original)])
        ).reduce(
          (acc, c) => ({
            ...acc,
            [c === prev ? newKey : c]: c === prev ? originalList : original[c],
          }),
          original
        );
        parent.conditions.default = originalDefault;
        prev = newKey;
        onChange({ ...value });
      });
    },
    [editConditionDetails, onChange, value]
  );

  const editTrigger: AutomationBuilderContext['editTrigger'] = useCallback(() => {
    hidePanel();
    setTriggerEditing({
      trigger: value.when,
      onChange: (when) => {
        onChange({ ...value, when });
      },
    });
    setPanelIsOpen(true);
  }, [hidePanel, onChange, value]);

  const editOutput: AutomationBuilderContext['editOutput'] = useCallback(() => {
    hidePanel();
    setOutputEditing({
      output: value.output,
      onChange: (output) => {
        onChange({ ...value, output });
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
        editOutput,
        getApp,
        instructionsSchemas,
        getSchema,
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden bg-blue-200">
        <ReactFlow
          elements={elements}
          nodesConnectable={false}
          nodesDraggable={nodesDraggable}
          elementsSelectable
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnScroll
          panOnScrollSpeed={1}
        >
          <Controls />
        </ReactFlow>
        <Panel visible={panelIsOpen} onVisibleChange={hidePanel}>
          {instructionEditing && <InstructionForm {...instructionEditing} />}
          {conditionEditing && <ConditionForm {...conditionEditing} />}
          {triggerEditing && <TriggerForm {...triggerEditing} />}
          {outputEditing && !triggerEditing && (
            <OutputForm {...outputEditing} />
          )}
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
