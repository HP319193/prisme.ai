import '@prisme.ai/types';
import { NextFunction, Request, Response, Router } from 'express';
import { ActionType } from '../..';
import { CollaboratorNotFound } from '../errors';
import { SubjectCollaborator } from '../types';
import { fetchUsers } from './fetchUsers';
import { asyncRoute, ExtendedRequest } from './utils';

export function initCollaboratorRoutes<SubjectType extends string>(
  app: Router
) {
  async function getPermissionsHandler(
    {
      params: { subjectType, subjectId },
      accessManager,
    }: Request<
      PrismeaiAPI.GetPermissions.PathParameters,
      PrismeaiAPI.GetPermissions.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.GetPermissions.Responses.$200>,
    next: NextFunction
  ) {
    const subject = await accessManager.get(
      subjectType as SubjectType,
      subjectId
    );

    await accessManager.throwUnlessCan(
      ActionType.ManagePermissions,
      subjectType as SubjectType,
      subject
    );

    const contacts = await fetchUsers({
      ids: Object.keys(subject.permissions || {}).map((userId) => userId),
    });

    const users = await Promise.all(
      Object.entries(subject.permissions || {}).map(
        async ([userId, collaborator]) => {
          return {
            ...(collaborator as SubjectCollaborator<Prismeai.Role>),
            id: userId,
            email: contacts.find((cur) => cur.id === userId)?.email || '',
          };
        }
      )
    );

    return res.send({ result: users });
  }

  async function shareHandler(
    {
      params: { subjectType, subjectId },
      accessManager,
      body,
    }: Request<
      PrismeaiAPI.Share.PathParameters,
      PrismeaiAPI.Share.Responses.$200,
      PrismeaiAPI.Share.RequestBody
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.Share.Responses.$200>,
    next: NextFunction
  ) {
    const { email, ...permissions } = body;
    const users = await fetchUsers({ email });
    if (!users.length) {
      throw new CollaboratorNotFound(
        `Could not find any user corresponding to ${email}`
      );
    }
    const collaborator = users[0];

    const sharedSubject = await accessManager.grant(
      subjectType as SubjectType,
      subjectId,
      collaborator,
      permissions
    );
    return res.send({
      ...(sharedSubject.permissions?.[<any>collaborator.id] || {}),
      email,
      id: collaborator.id,
    });
  }

  async function revokeCollaborator(
    {
      params: { subjectType, subjectId, userId },
      accessManager,
    }: Request<
      PrismeaiAPI.RevokePermissions.PathParameters,
      PrismeaiAPI.RevokePermissions.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.RevokePermissions.Responses.$200>,
    next: NextFunction
  ) {
    await accessManager.revoke(<any>subjectType, subjectId, {
      id: userId,
    });

    return res.send({ id: userId });
  }

  const baseRoute = '/v2/:subjectType/:subjectId/permissions';
  app.get(`${baseRoute}`, asyncRoute(getPermissionsHandler));
  app.post(`${baseRoute}`, asyncRoute(shareHandler));
  app.delete(`${baseRoute}/:userId`, asyncRoute(revokeCollaborator));
}
