import '@prisme.ai/types';
import { NextFunction, Request, Response, Router } from 'express';
import { ActionType } from '../..';
import { CollaboratorNotFound } from '../errors';
import { SubjectCollaborator } from '../types';
import { permissionIdToTarget, permissionTargetToId } from '../utils';
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
        async ([permId, permissions]: [string, any]) => {
          return {
            target: permissionIdToTarget(permId),
            permissions: permissions as SubjectCollaborator,
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
    const { id, public: publicShare, role } = target;

    target.id = permissionTargetToId(target);
    if (role) {
      // Share to a role
      target.displayName = `Role: ${role}`;
    } else if (publicShare) {
      // Share to everyone
      target.displayName = 'Public';
    } else if (id) {
      // Share to a userId. Must be handled last as others target have their respective id too (i.e id="*"" for public)
      const users: (Prismeai.User & { id: string })[] = await fetchUsers({
        ids: [id!],
      });
      if (!users.length) {
        throw new CollaboratorNotFound(`This user does not exist`);
      }
      target.displayName = `${<any>users[0].firstName} ${<any>(
        users[0].lastName
      )}`;
    }

    const sharedSubject = await accessManager.grant(
      subjectType as SubjectType,
      subjectId,
      target,
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
      params: { subjectType, subjectId, id },
      accessManager,
    } = req;
    const subject = await accessManager.revoke(<any>subjectType, subjectId, id);

    if (callbacks?.onRevoked) {
      let displayName;
      if (id !== '*') {
        try {
          const users = await fetchUsers({ ids: [id] });
          displayName = `${users?.[0]?.firstName} ${users?.[0]?.lastName}`;
        } catch {}
      }
      callbacks.onRevoked(
        req,
        subjectType,
        subjectId,
        { id: id, displayName },
        subject
      );
    }

    return res.send({ id: id });
  }

  const baseRoute = '/v2/:subjectType/:subjectId/permissions';
  app.get(`${baseRoute}`, asyncRoute(getPermissionsHandler));
  app.post(`${baseRoute}`, asyncRoute(shareHandler));
  app.delete(`${baseRoute}/:id`, asyncRoute(revokeCollaborator));
}
