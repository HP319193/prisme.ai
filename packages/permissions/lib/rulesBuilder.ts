import { Schema } from 'mongoose';
import { Ability, RawRuleOf, MongoQuery } from '@casl/ability';
import { User, ActionType } from './types';
import { RoleTemplates, SubjectOptions } from '..';

export interface RuleContext {
  user: User<string>;
  subject?: { id?: string };
}

function injectPlaceholders(value: any, ctx: RuleContext) {
  if (typeof value !== 'string') {
    return value;
  }
  return value
    .replace('${user.id}', ctx.user.id)
    .replace('${subject.id}', ctx.subject?.id || '');
}

function injectConditions(conditions: object, ctx: RuleContext): MongoQuery {
  return Object.entries(conditions).reduce((injected, [k, v]) => {
    const injectedKey = injectPlaceholders(k, ctx);
    if (typeof v === 'object' && !Array.isArray(v)) {
      return {
        ...injected,
        [injectedKey]: injectConditions(v, ctx),
      };
    }
    return {
      ...injected,
      [injectedKey]: injectPlaceholders(v, ctx),
    };
  }, {});
}

export function injectRules(rules: RawRuleOf<Ability>[], ctx: RuleContext) {
  return rules.map((cur) => {
    let conditions = cur.conditions;
    if (conditions) {
      conditions = injectConditions({ ...conditions }, ctx);
    }
    return { ...cur, conditions };
  });
}

// Sort rules from the most generic to the most specific (otherwise 'cannot' rules could be overriden by 'can')
export function sortRules(rules: RawRuleOf<Ability>[]) {
  return rules.sort((a, b) => {
    if ((!a.inverted && b.inverted) || (a.inverted && !b.inverted)) {
      return b.inverted ? -1 : 1; // 'cannot' rules always in last positions
    }
    const aScore = (a.subject ? 1 : 0) + Object.keys(a.conditions || {}).length;
    const bScore = (b.subject ? 1 : 0) + Object.keys(b.conditions || {}).length;
    return bScore < aScore ? aScore - bScore : bScore - aScore;
  });
}

export function nativeRules(
  user: User<string>,
  roles: RoleTemplates<any, string>,
  subjects: Record<any, SubjectOptions<any>>
) {
  const anySubjectPermissionsGrantEquivalentActions: RawRuleOf<Ability>[] =
    Object.values(ActionType).flatMap((action) => [
      {
        action,
        subject: 'all',
        conditions: {
          [`permissions.\${user.id}.policies.${action}`]: true,
        },
      },
      {
        action,
        subject: 'all',
        conditions: {
          [`permissions.*.policies.${action}`]: true,
        },
      },
    ]);

  const anySubjectRoleGrantReadAccess: RawRuleOf<Ability>[] = Object.entries(
    subjects
  ).flatMap(([subjectType, subjectOpts]) => {
    const rolesWithReadPolicy = roles
      .filter((cur) => cur.subjectType && cur.subjectType === subjectType)
      .map((cur) => cur.name);
    return [
      {
        subject: subjectType as string,
        action: ActionType.Read as string,
        conditions: {
          'permissions.${user.id}.role': {
            $exists: true,
            $in: rolesWithReadPolicy,
          },
        },
      },
      {
        subject: subjectType as string,
        action: ActionType.Read as string,
        conditions: {
          'permissions.*.role': {
            $exists: true,
            $in: rolesWithReadPolicy,
          },
        },
      },
    ];
  });

  const subjectsWithAuthorManagePolicy = Object.entries(subjects)
    .filter(([_, subjectOpts]) => !subjectOpts?.author?.disableManagePolicy)
    .map(([subjectType]) => subjectType);
  const subjectAuthorsHaveManageAccess: RawRuleOf<Ability>[] = [
    {
      // Everyone can manage its own subject
      action: ActionType.Manage,
      subject: subjectsWithAuthorManagePolicy,
      conditions: { createdBy: '${user.id}' },
    },
    {
      inverted: true,
      action: ActionType.Update,
      subject: 'all',
      fields: ['permissions'],
      conditions: {
        [`permissions.\${user.id}.policies.manage_permissions`]: {
          $ne: true,
        },
        createdBy: { $ne: '${user.id}' },
      },
    },
  ];

  const rules = [
    ...subjectAuthorsHaveManageAccess,
    ...anySubjectPermissionsGrantEquivalentActions,
    ...anySubjectRoleGrantReadAccess,
  ];

  return injectRules(rules, { user });
}

export async function validateRules(
  rules: RawRuleOf<Ability>[],
  schemas: Record<string, Schema | false>
) {
  for (const rule of rules) {
    const targetSubjects =
      rule.subject === 'all'
        ? Object.keys(schemas)
        : Array.isArray(rule.subject)
        ? rule.subject
        : [rule.subject];
    for (const subject of targetSubjects) {
      const schema = schemas[subject as string];
      if (schema === false) {
        continue;
      }
      if (!schema) {
        throw new Error(
          `Permission rules refers to subject type '${subject}' which hasn't any defined schema : ${JSON.stringify(
            rule
          )}. If you do not want any persistance schema, please set it to false.`
        );
      }
      const fields = Object.keys(rule.conditions || {}).map(
        (field) => field.split('.')[0]
      );
      const unknownFields = fields.filter(
        (cur) => cur !== 'id' && !schema.path(cur)
      );
      if (unknownFields.length) {
        throw new Error(
          `A permission rule condition refers to some unknown fields '${unknownFields.join(
            ', '
          )}' within subject '${subject}' (these fields must be declared in corresponding schema) : ${JSON.stringify(
            rule
          )}`
        );
      }
    }
  }
}
