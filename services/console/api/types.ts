import "@prisme.ai/types";

export interface Workspace
  extends Pick<Prismeai.Workspace, "owner" | "imports" | "constants">,
    Required<Omit<Prismeai.Workspace, "owner" | "imports" | "constants">> {}
