import { validateWorkspace } from "@prisme.ai/validation";
const ret = validateWorkspace({
  name: "",
  automations: {
    test: {
      name: "test",
      do: [],
    },
  },
});
console.log(ret, ret.errors);
