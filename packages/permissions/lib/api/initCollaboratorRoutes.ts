import '@prisme.ai/types';
import { NextFunction, Request, Response, Router } from 'express';
import { ActionType } from '../..';
import { CollaboratorNotFound } from '../errors';
import { PublicAccess } from '../permissions';
import { SubjectCollaborator } from '../types';
import { fetchUsers } from './fetchUsers';
import { asyncRoute, ExtendedRequest } from './utils';

export interface PermissionsRoutesCallbacks<SubjectType extends string> {
  onShared: (
    req: Request<any, any, any> & ExtendedRequest<SubjectType>,
    subjectType: string,
    subjectId: string,
    permissions: Prismeai.UserPermissions
  ) => any;

  onRevoked: (
    req: Request<any, any, any> & ExtendedRequest<SubjectType>,
    subjectType: string,
    subjectId: string,
    userId: string
  ) => any;
}
export function initCollaboratorRoutes<SubjectType extends string>(
  app: Router,
  middleware: (
    req: Request<
      PrismeaiAPI.GetPermissions.PathParameters,
      PrismeaiAPI.GetPermissions.Responses.$200,
      any
    >,
    res: Response<PrismeaiAPI.GetPermissions.Responses.$200>,
    next: NextFunction
  ) => void,
  callbacks?: PermissionsRoutesCallbacks<SubjectType>
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
      ids: Object.keys(subject.permissions || {})
        .map((userId) => userId)
        .filter((userId) => userId !== PublicAccess),
    });

    const users = await Promise.all(
      Object.entries(subject.permissions || {}).map(
        async ([userId, collaborator]) => {
          if (userId === PublicAccess) {
            return {
              ...(collaborator as SubjectCollaborator<Prismeai.Role>),
              id: userId,
              public: true,
            };
          }

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
    req: Request<
      PrismeaiAPI.Share.PathParameters,
      PrismeaiAPI.Share.Responses.$200,
      PrismeaiAPI.Share.RequestBody
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.Share.Responses.$200>,
    next: NextFunction
  ) {
    const {
      params: { subjectType, subjectId },
      accessManager,
      body,
    } = req;
    const { email, public: publicShare, ...permissions } = body;
    const users: ((Prismeai.User & { id: string }) | typeof PublicAccess)[] =
      publicShare ? [PublicAccess] : await fetchUsers({ email });
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

    if (callbacks?.onShared) {
      callbacks.onShared(req, subjectType, subjectId, {
        ...body,
        id: (<any>collaborator)?.id,
      });
    }

    if (collaborator === PublicAccess) {
      return res.send({
        ...(sharedSubject.permissions?.[PublicAccess] || {}),
        public: true,
        id: PublicAccess,
      });
    }
    return res.send({
      ...(sharedSubject.permissions?.[<any>collaborator.id] || {}),
      email,
      id: collaborator.id,
    });
  }

  async function revokeCollaborator(
    req: Request<
      PrismeaiAPI.RevokePermissions.PathParameters,
      PrismeaiAPI.RevokePermissions.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.RevokePermissions.Responses.$200>,
    next: NextFunction
  ) {
    const {
      params: { subjectType, subjectId, userId },
      accessManager,
    } = req;
    await accessManager.revoke(
      <any>subjectType,
      subjectId,
      userId === PublicAccess
        ? PublicAccess
        : {
            id: userId,
          }
    );

    if (callbacks?.onRevoked) {
      callbacks.onRevoked(req, subjectType, subjectId, userId);
    }

    return res.send({ id: userId });
  }

  const baseRoute = '/v2/:subjectType/:subjectId/permissions';
  if (middleware) {
    app.use(`${baseRoute}`, middleware);
  }
  app.get(`${baseRoute}`, asyncRoute(getPermissionsHandler));
  app.post(`${baseRoute}`, asyncRoute(shareHandler));
  app.delete(`${baseRoute}/:userId`, asyncRoute(revokeCollaborator));
}
