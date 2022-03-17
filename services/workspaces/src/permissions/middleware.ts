import { PermissionsMiddleware } from '@prisme.ai/permissions';
import { SubjectType } from './config';

export const permissionsMiddleware: PermissionsMiddleware = async (
  req,
  res,
  next
) => {
  const {
    params: { subjectType, subjectId },
    accessManager,
  } = req;
  if (subjectType === SubjectType.Page) {
    const [workspaceId] = subjectId.split(':');
    req.context.workspaceId = workspaceId;
    try {
      await accessManager.get(SubjectType.Workspace, workspaceId);
    } catch (e) {}
  }
  next();
};
