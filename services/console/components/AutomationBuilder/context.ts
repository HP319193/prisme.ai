import { Schema } from '@prisme.ai/design-system';
import { createContext, useContext } from 'react';

export interface AutomationBuilderContext {
  addInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  removeInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editCondition: (
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
    addInstruction() {},
    removeInstruction() {},
    editInstruction() {},
    editCondition() {},
    editTrigger() {},
    editOutput() {},
    getApp() {
      return {
        name: '',
        icon: '',
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
