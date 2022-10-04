import { Schema } from '@prisme.ai/design-system';
import { createContext, useContext } from 'react';

export interface AutomationBuilderContext {
  automationId: string;
  addInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  removeInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editCondition: (
    parent: { conditions: Prismeai.Conditions },
    key: string
  ) => void;
  removeCondition: (
    parent: { conditions: Prismeai.Conditions },
    key: string
  ) => void;
  editTrigger: () => void;
  editOutput: () => void;
  getApp: (
    instruction: string
  ) => {
    name: string;
    icon: string;
    instructionName: string;
  };
  instructionsSchemas: [
    string,
    Record<string, Schema & { description?: string }>,
    { icon: string }
  ][];
  getSchema: (name: string) => Schema;
}
export const automationBuilderContext = createContext<AutomationBuilderContext>(
  {
    automationId: '',
    addInstruction() {},
    removeInstruction() {},
    editInstruction() {},
    editCondition() {},
    removeCondition() {},
    editTrigger() {},
    editOutput() {},
    getApp() {
      return {
        name: '',
        icon: '',
        instructionName: '',
      };
    },
    instructionsSchemas: [],
    getSchema() {
      return {} as Schema;
    },
  }
);

export const useAutomationBuilder = () => useContext(automationBuilderContext);

export default automationBuilderContext;
