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
    permissions: Prismeai.UserPermissions,
    subject: object & { id: string }
  ) => any;

  onRevoked: (
    req: Request<any, any, any> & ExtendedRequest<SubjectType>,
    subjectType: string,
    subjectId: string,
    target: Prismeai.UserPermissionsTarget,
    subject: object & { id: string }
  ) => any;
}
export function initCollaboratorRoutes<SubjectType extends string>(
  app: Router,
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

    const users = await Promise.all(
      Object.entries(subject.permissions || {}).map(
        async ([userId, permissions]: [string, any]) => {
          return {
            target:
              userId === PublicAccess
                ? {
                    id: userId,
                    public: true,
                  }
                : { id: userId },
            permissions: permissions as SubjectCollaborator<string>,
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
    const { target, permissions } = body;
    const { id, public: publicShare } = target;
    const users: (Prismeai.User & { id: string })[] = publicShare
      ? [{ id: PublicAccess } as any]
      : await fetchUsers({ ids: [id!] });
    if (!users.length) {
      throw new CollaboratorNotFound(`This user does not exist`);
    }
    const collaborator = users[0];
    target.id = (<any>collaborator)?.id;
    target.displayName = `${(<any>collaborator)?.firstName} ${
      (<any>collaborator)?.lastName
    }`;

    const sharedSubject = await accessManager.grant(
      subjectType as SubjectType,
      subjectId,
      collaborator,
      permissions
    );

    if (callbacks?.onShared) {
      callbacks.onShared(
        req,
        subjectType,
        subjectId,
        {
          target,
          permissions,
        },
        sharedSubject
      );
    }

    return res.send({
      target,
      permissions,
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
    const subject = await accessManager.revoke(
      <any>subjectType,
      subjectId,
      userId === PublicAccess
        ? PublicAccess
        : {
            id: userId,
          }
    );

    if (callbacks?.onRevoked) {
      let displayName;
      if (userId !== '*') {
        try {
          const users = await fetchUsers({ ids: [userId] });
          displayName = `${users?.[0]?.firstName} ${users?.[0]?.lastName}`;
        } catch {}
      }
      callbacks.onRevoked(
        req,
        subjectType,
        subjectId,
        { id: userId, displayName },
        subject
      );
    }

    return res.send({ id: userId });
  }

  const baseRoute = '/v2/:subjectType/:subjectId/permissions';
  app.get(`${baseRoute}`, asyncRoute(getPermissionsHandler));
  app.post(`${baseRoute}`, asyncRoute(shareHandler));
  app.delete(`${baseRoute}/:userId`, asyncRoute(revokeCollaborator));
}
