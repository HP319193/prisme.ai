import { createContext, useContext } from 'react';
import { Schema } from '../SchemaForm/types';

export interface AutomationBuilderContext {
  addInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  removeInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editInstruction: (parent: Prismeai.InstructionList, index: number) => void;
  editCondition: (
    parent: { conditions: Prismeai.Conditions },
    key: string
  ) => void;
  editTrigger: () => void;
  getApp: (
    instruction: string
  ) => {
    name: string;
    icon: string;
  };
  instructionsSchemas: [string, Record<string, Schema>, { icon: string }][];
  getSchema: (name: string) => Schema;
}
export const automationBuilderContext = createContext<AutomationBuilderContext>(
  {
    addInstruction() {},
    removeInstruction() {},
    editInstruction() {},
    editCondition() {},
    editTrigger() {},
    getApp() {
      return {
        name: '',
        icon: '',
      };
    },
    instructionsSchemas: [],
    getSchema() {
      return {};
    },
  }
);

export const useAutomationBuilder = () => useContext(automationBuilderContext);

export default automationBuilderContext;
