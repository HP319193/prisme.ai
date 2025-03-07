import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import Panel from '../Panel';
import InstructionForm from './Panel/InstructionForm';
import ConditionForm from './Panel/ConditionForm';
import BUILTIN_INSTRUCTIONS from '@prisme.ai/validation/instructions.json';
import { useTranslation } from 'next-i18next';
import TriggerForm from './Panel/TriggerForm';
import { generateEndpoint } from '../../utils/urls';
import OutputBlock from './OutputBlock';
import OutputForm from './Panel/OutputForm';
import useLocalizedText from '../../utils/useLocalizedText';
import { Schema } from '@prisme.ai/design-system';
import removeAccent from 'remove-accents';

type InstructionSchemaTupple = [
  string,
  Record<string, Schema & { description?: string; search?: string }>,
  { icon: string }
];
interface AutomationBuilderProps {
  id: string;
  workspaceId: string;
  value: Prismeai.Automation;
  onChange: Dispatch<SetStateAction<Prismeai.Automation>>;
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
  workspaceId,
  value,
  onChange,
  customInstructions,
}) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();

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
  const [blockEditingOnBack, setBlockEditingOnBack] = useState<() => void>();

  useEffect(() => {
    setTimeout(() =>
      zoomPanHelper.fitView({
        maxZoom: 0.8,
        duration: 200,
      })
    );
  }, [zoomPanHelper, id]);

  const elements = useMemo(() => {
    try {
      const flow = buildFlow(value);
      if (value.when && value.when.endpoint) {
        flow[0].data.endpoint = generateEndpoint(
          workspaceId,
          `${
            value.when.endpoint === 'true' || value.when.endpoint === true
              ? value.slug || id // value.slug can be more up to date than id
              : value.when.endpoint
          }`
        );
      }
      return flow;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [id, value, workspaceId]);

  const instructionsSchemas: InstructionSchemaTupple[] = useMemo(
    () => [
      [
        t('automations.instruction.title_builtin'),
        Object.keys(BUILTIN_INSTRUCTIONS).reduce(
          (prev, name) => ({
            ...prev,
            [name]: {
              ...(BUILTIN_INSTRUCTIONS as any)[name].properties[name],
              search: removeAccent(
                `${name} ${t('automations.instruction.label', {
                  context: name,
                })} ${t('automations.instruction.description', {
                  context: name,
                })}`
              ),
            },
          }),
          {}
        ),
        { icon: iconPrisme.src },
      ],
      ...(customInstructions || []).map<InstructionSchemaTupple>(
        ({ appName = '', automations, icon = '' }) => {
          return [
            appName,
            Object.keys(automations).reduce((prev, name) => {
              if (name === id) return prev;
              const properties =
                {
                  ...automations[name].arguments,
                } || {};
              properties.output = properties.output || {
                type: 'string',
                description: t('automations.instruction.output.description'),
                title: t('automations.instruction.output.label'),
              };
              return {
                ...prev,
                [name]: {
                  type: 'object',
                  properties,
                  description: localize(automations[name].description),
                  name: localize(automations[name].name),
                  search: removeAccent(
                    `${name} ${localize(automations[name].name)} ${localize(
                      automations[name].description
                    )}`
                  ),
                },
              };
            }, {}),
            { icon },
          ];
        }
      ),
    ],
    [customInstructions, id, localize, t]
  );

  const hidePanel = useCallback(async () => {
    setBlockEditingOnBack(undefined);
    setPanelIsOpen(false);
    setInstructionEditing(undefined);
    setConditionEditing(undefined);
    setTriggerEditing(undefined);
    setOutputEditing(undefined);
    return new Promise((resolve) => setTimeout(resolve, 10));
  }, []);

  const prevValue = useRef(value);
  useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    hidePanel();
  }, [hidePanel, value]);

  const editInstructionDetails = useCallback(
    async (instruction: Prismeai.Instruction, onChange: any) => {
      await hidePanel();
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

  const editInstruction: AutomationBuilderContext['addInstruction'] =
    useCallback(
      async (parent, index = 0) => {
        if (!parent) return;
        try {
          const instruction = parent[index];
          if (!instruction) return;

          editInstructionDetails(
            instruction,
            (updatedInstruction: Prismeai.Instruction) => {
              parent.splice(index, 1, updatedInstruction);
              onChange((value) => {
                prevValue.current = { ...value };
                return prevValue.current;
              });
            }
          );
        } catch (e) {}
      },
      [editInstructionDetails, onChange]
    );

  const addInstruction: AutomationBuilderContext['addInstruction'] =
    useCallback(
      async (parent, index = 0) => {
        if (!parent) return;
        let instruction = {};
        editInstructionDetails(
          instruction,
          (updatedInstruction: Prismeai.Instruction) => {
            setBlockEditingOnBack(() => () => {
              parent.splice(index, 1);
              setBlockEditingOnBack(undefined);
              addInstruction(parent, index);
              onChange((value) => {
                prevValue.current = { ...value };
                return prevValue.current;
              });
            });
            parent.splice(
              index,
              Object.keys(instruction).length === 0 ? 0 : 1,
              updatedInstruction
            );
            instruction = updatedInstruction;

            onChange((value) => {
              prevValue.current = { ...value };
              return prevValue.current;
            });
          }
        );
      },
      [editInstructionDetails, onChange]
    );

  const removeInstruction: AutomationBuilderContext['removeInstruction'] =
    useCallback(
      (parent, index) => {
        parent.splice(index, 1);
        onChange((value) => {
          prevValue.current = { ...value };
          return prevValue.current;
        });
        setTimeout(hidePanel);
      },
      [hidePanel, onChange]
    );

  const editConditionDetails = useCallback(
    async (condition: string, onChange: (condition: string) => void) => {
      await hidePanel();
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
        onChange((value) => {
          prevValue.current = { ...value };
          return prevValue.current;
        });
      });
    },
    [editConditionDetails, onChange]
  );

  const removeCondition: AutomationBuilderContext['removeCondition'] =
    useCallback(
      (parent, key) => {
        delete parent.conditions[key as keyof typeof parent.conditions];
        onChange((value) => {
          prevValue.current = { ...value };
          return prevValue.current;
        });
        setTimeout(hidePanel);
      },
      [hidePanel, onChange]
    );

  const editTrigger: AutomationBuilderContext['editTrigger'] =
    useCallback(async () => {
      await hidePanel();
      setTriggerEditing({
        trigger: value.when,
        onChange: (when) => {
          onChange((value) => {
            prevValue.current = { ...value, when };
            return prevValue.current;
          });
        },
      });
      setPanelIsOpen(true);
    }, [hidePanel, onChange, value]);

  const editOutput: AutomationBuilderContext['editOutput'] =
    useCallback(async () => {
      await hidePanel();
      setOutputEditing({
        output: value.output,
        onChange: (output) => {
          onChange((value) => {
            prevValue.current = { ...value, output };
            return prevValue.current;
          });
        },
      });
      setPanelIsOpen(true);
    }, [hidePanel, onChange, value]);

  const getApp: AutomationBuilderContext['getApp'] = useCallback(
    (instruction) => {
      const [
        name,
        { [instruction]: { name: instructionName = '' } = {} },
        { icon },
      ] =
        instructionsSchemas.find(([, instructions]) => {
          return Object.keys(instructions).includes(instruction);
        }) || instructionsSchemas[0];
      return {
        name,
        icon,
        instructionName,
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
      const l = (key: string) =>
        t(key, {
          interpolation: {
            skipOnVariables: true,
          },
          defaultValue: '',
        });
      const localizeSchema = (schema: Schema, name: string) => {
        if (!name) return schema;
        const localizedSchema = { ...schema };
        const { title, description } = localizedSchema;
        localizedSchema.title =
          l(`automations.instruction.form.${name}.label`) ||
          (typeof title === 'string' ? localize(title) : title);
        localizedSchema.description =
          l(`automations.instruction.form.${name}.description`) ||
          (typeof description === 'string'
            ? localize(description)
            : description);
        localizedSchema.add = l(`automations.instruction.form.${name}.add`);
        localizedSchema.remove = l(
          `automations.instruction.form.${name}.remove`
        );
        const { properties, items, enum: _enum, oneOf } = localizedSchema;
        if (properties) {
          Object.keys(properties).forEach(
            (k) =>
              (properties[k] = localizeSchema(properties[k], `${name}.${k}`))
          );
        }
        if (items) {
          localizedSchema.items = localizeSchema(items, `${name}.items`);
        }
        if (_enum && Array.isArray(_enum) && _enum.length > 0) {
          const localized = _enum.map((enumName) =>
            l(`automations.instruction.form.${name}.enum.${enumName}`)
          );
          localizedSchema.enumNames = localized;
        }
        if (oneOf) {
          oneOf.forEach((one, k) => {
            oneOf[k] = localizeSchema(one, name);
          });
        }
        return localizedSchema;
      };
      return localizeSchema({ ...schema }, instructionName);
    },
    [instructionsSchemas, localize, t]
  );

  const [panelTitle, setPanelTitle] = useState('');
  useEffect(() => {
    if (instructionEditing) {
      setPanelTitle(t('automations.instruction.panel'));
      return;
    }
    if (conditionEditing) {
      setPanelTitle(t('automations.condition.panel'));
      return;
    }
    if (triggerEditing) {
      setPanelTitle(t('automations.trigger.panel'));
      return;
    }
    if (outputEditing) {
      setPanelTitle(t('automations.output.panel'));
      return;
    }
    setPanelTitle(t('automations.details.title'));
  }, [conditionEditing, instructionEditing, outputEditing, t, triggerEditing]);

  return (
    <automationBuilderContext.Provider
      value={{
        automationId: id,
        addInstruction,
        removeInstruction,
        editInstruction,
        editCondition,
        removeCondition,
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
          elementsSelectable
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnScroll
          panOnScrollSpeed={1}
          nodesDraggable={false}
        >
          <Controls />
        </ReactFlow>
        <Panel
          title={panelTitle}
          visible={panelIsOpen}
          onVisibleChange={hidePanel}
          onBack={blockEditingOnBack}
        >
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
