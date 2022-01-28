import { PermissionsConfig } from "..";
import abac from "./abac";
import roles, { Role } from "./roles";

export enum SubjectType {
  User = "user",
  Workspace = "workspace",
  Page = "page",
  Event = "event",
}

const config: PermissionsConfig<SubjectType> = {
  subjectTypes: roles.subjectTypes,
  rbac: roles.rbac,
  abac: abac.abac,
};

export default config;
export { Role };
