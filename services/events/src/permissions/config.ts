import { PermissionsConfig, ActionType } from "@prisme.ai/permissions";

export enum SubjectType {
  Workspace = "workspaces",
  Event = "events",
}

export enum Role {
  Admin = "admin",
  Collaborator = "collaborator",
}

export const config: PermissionsConfig<
  SubjectType,
  Prismeai.Role,
  Prismeai.ApiKeyRules
> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    {
      name: Role.Admin,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            "source.workspaceId": "${subject.id}",
          },
        },
      ],
    },

    {
      name: Role.Collaborator,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            "source.workspaceId": "${subject.id}",
          },
        },
        {
          inverted: true,
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $regex: "^apikeys\\..*$",
            },
            // This role only applies to a specific workspace !
            "source.workspaceId": "${subject.id}",
          },
        },
      ],
    },
  ],
  abac: [],
  customRulesBuilder: (role) => {
    if (role.type !== "apiKey") {
      throw new Error("Unsupported custom role " + JSON.stringify(role));
    }

    if (role.subjectType === SubjectType.Workspace) {
      if (!role?.rules?.events) {
        return [];
      }

      const escapedAllowedEvents = role.rules.events.map((cur) =>
        cur.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[*]/g, ".*")
      );
      const allowedEventsRegex = `^(${escapedAllowedEvents.join("|")})$`;

      return [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $regex: allowedEventsRegex,
            },
            "source.workspaceId": role.subjectId,
          },
        },
      ];
    }
    throw new Error("Unsupported api key");
  },
};
