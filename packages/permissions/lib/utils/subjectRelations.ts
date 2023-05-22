import {
  PermissionsConfig,
  Subject,
  SubjectFieldRef,
  SubjectRelations,
} from '../types';
import { extractObjectsByPath } from './extractObjectsByPath';

/*
 * SubjectRelations maps child subjects to their parent subject type with the corresponding id field
 * It is automatically computed from PermissionsConfig.rbac
 * Example :
 * {
 *   apps: [ { subject: 'workspaces', field: 'workspaceId' } ],
 *   pages: [ { subject: 'workspaces', field: 'workspaceId' } ],
 * }
 * 'field' points to apps/pages field name where we have the parent workspace id
 */

export function buildSubjectRelations<
  SubjectType extends string,
  Role extends string = string
>(
  permissionsConfig: PermissionsConfig<SubjectType, Role>
): SubjectRelations<SubjectType> {
  return (permissionsConfig.rbac || []).reduce((subjectFieldRefs, role) => {
    const parentSubject = role.subjectType;
    if (!parentSubject || !role?.rules?.length) {
      return subjectFieldRefs;
    }
    const fieldRefs = role.rules
      .map(({ subject: childSubject, inverted, conditions }) => {
        if (inverted || !conditions || childSubject == parentSubject) {
          return false;
        }
        const childField: string = Object.keys(conditions).find(
          (field) => conditions[field] === '${subject.id}'
        ) as string;
        return {
          field: childField,
          subject: childSubject,
        };
      })
      .filter(Boolean) as SubjectFieldRef<SubjectType>[];

    return {
      ...subjectFieldRefs,
      ...fieldRefs.reduce(
        (fieldRefs, cur) => ({
          ...fieldRefs,
          [cur.subject]: [
            {
              subject: parentSubject,
              field: cur.field,
            },
            ...(subjectFieldRefs[cur.subject as SubjectType] || []),
          ].filter(
            (cur, idx, arr) =>
              arr.findIndex(
                ({ subject, field }) =>
                  cur.subject === subject && cur.field === field
              ) === idx
          ),
        }),
        {}
      ),
    };
  }, {} as Record<SubjectType, SubjectFieldRef<SubjectType>[]>);
}

export function getParentSubjectIds<SubjectType extends string>(
  relations: SubjectRelations<SubjectType>,
  childType: SubjectType,
  child: Subject<any>
): { subjectType: SubjectType; subjectId: string }[] {
  const parentRefs = relations[childType];
  if (!parentRefs) {
    return [];
  }
  return parentRefs
    .map(({ subject: subjectType, field }) => ({
      subjectType,
      subjectId: extractObjectsByPath(child, field),
    }))
    .filter((cur) => cur.subjectId);
}
