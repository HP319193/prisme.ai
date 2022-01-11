import { createContext, useContext } from "react";
import { Workspace } from "../../api/types";
import { ValidationError } from "../../utils/yaml";

export interface AutomationLayoutContext {
  automation: Prismeai.Automation;
  setAutomation: (automation: Prismeai.Automation) => void;
  reset: () => void;
  save: () => void;
  invalid: false | ValidationError[];
}

export const automationLayoutContext = createContext<AutomationLayoutContext>({
  automation: {
    id: "",
    name: "",
    triggers: {},
    workflows: {},
  },
  setAutomation() {},
  reset() {},
  save() {},
  invalid: false,
});

export const useAutomation = () => useContext(automationLayoutContext);

export default automationLayoutContext;
