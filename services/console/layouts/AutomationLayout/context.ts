import { createContext, useContext } from "react";
import { ValidateFunction } from "ajv";
import { Workspace } from "../../api/types";
import { ValidationError } from "../../utils/yaml";

export interface AutomationLayoutContext {
  automation: {
    name: string;
    value: Workspace["automations"][0];
  };
  setAutomation: (automation: Workspace["automations"][0]) => void;
  reset: () => void;
  save: () => void;
  invalid: false | ValidationError[];
}
export const automationLayoutContext = createContext<AutomationLayoutContext>({
  automation: {
    name: "",
    value: {
      triggers: {},
      workflows: {},
    },
  },
  setAutomation() {},
  reset() {},
  save() {},
  invalid: false,
});

export const useAutomation = () => useContext(automationLayoutContext);

export default automationLayoutContext;
