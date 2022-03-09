import { PermissionsMiddleware } from '@prisme.ai/permissions';
import { SubjectType } from './config';

export const permissionsMiddleware: PermissionsMiddleware = async (
  { params: { subjectType, subjectId }, accessManager },
  res,
  next
) => {
  if (subjectType === SubjectType.Page) {
    const [workspaceId] = subjectId.split(':');
    try {
      await accessManager.get(SubjectType.Workspace, workspaceId);
    } catch (e) {}
  }
  next();
};
