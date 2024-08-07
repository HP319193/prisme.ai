import { ActionType, SubjectType } from '../../../../permissions';
import { Rule } from '@prisme.ai/permissions';
import { InvalidSecurity } from '../../../../errors';

const OnlyAllowedSubjects = [
  SubjectType.Workspace,
  SubjectType.Page,
  SubjectType.File,
  SubjectType.App,
  'events',
  'automations',
];
const OnlyAllowedActions = Object.values(ActionType);

// Validate user provided rules & scope them to the target workspace
export function validateUserRule(workspaceId: string, rule: Rule): Rule[] {
  const { action, subject, inverted, reason, conditions } = rule;
  const actions = Array.isArray(action) ? action : [action];
  const subjects = Array.isArray(subject) ? subject : [subject];

  // First validte subjects & actions
  if (
    !subjects.length ||
    subjects.some(
      (subject) => !OnlyAllowedSubjects.includes(subject as SubjectType)
    )
  ) {
    throw new InvalidSecurity(
      `Forbidden subjectType '${subject}' found in security rules`
    );
  }
  if (
    !actions.length ||
    actions.some(
      (action) => !OnlyAllowedActions.includes(action as SubjectType)
    )
  ) {
    throw new InvalidSecurity(
      `Forbidden actionType '${action}' found in security rules`
    );
  }

  // Then enforce workspace scoped conditions
  const ruleWithoutConditions = {
    action: actions,
    inverted,
    reason,
  };
  const rules: Rule[] = [];
  subjects.forEach((subject) => {
    if (subject === 'events') {
      const actionsWithoutCreate = actions.filter(
        (cur) => cur !== ActionType.Create
      );
      if (actionsWithoutCreate.length) {
        rules.push({
          ...ruleWithoutConditions,
          subject: 'events',
          action: actionsWithoutCreate,
          conditions: {
            ...conditions,
            'source.workspaceId': workspaceId,
          },
        });
      }
      // Create specific conditions : No one but the platform should be able to emit native events
      if (actionsWithoutCreate.length !== actions.length) {
        rules.push({
          ...ruleWithoutConditions,
          subject: 'events',
          action: 'create',
          conditions: {
            ...conditions,
            'source.workspaceId': workspaceId,
            'source.serviceTopic': 'topic:runtime:emit',
          },
        });
      }
    } else {
      const workspaceIdField =
        {
          [SubjectType.Workspace]: 'id',
          [SubjectType.App]: 'workspaceId',
          [SubjectType.File]: 'workspaceId',
          [SubjectType.Page]: 'workspaceId',
          ['automations']: 'runningWorkspaceId',
        }[subject as SubjectType] || 'workspaceId';

      rules.push({
        ...ruleWithoutConditions,
        subject,
        conditions: {
          ...conditions,
          [workspaceIdField]: workspaceId,
        },
      });
    }
  });

  return rules;
}
