import { createContext, useContext } from "react";
import { Workspace } from "../../api/types";

export interface AutomationLayoutContext {
  automation: {
    name: string;
    value: Workspace["automations"][0];
  };
  setAutomation: (automation: Workspace["automations"][0]) => void;
  reset: () => void;
  save: () => void;
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
});

export const useAutomation = () => useContext(automationLayoutContext);

export default automationLayoutContext;
