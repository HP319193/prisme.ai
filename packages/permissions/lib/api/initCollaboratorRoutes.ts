import { NextFunction, Request, Response, Router } from "express";
import { AccessManager, ActionType } from "../..";
import { CollaboratorNotFound } from "../errors";
import { SubjectCollaborator } from "../types";
import { fetchCollaboratorContacts } from "./fetchCollaboratorContacts";

type InstantiatedAccessManager<SubjectType extends string> = Required<
  AccessManager<SubjectType, { [k in SubjectType]: any }, Prismeai.Role>
>;
type ExtendedRequest<SubjectType extends string> = {
  accessManager: InstantiatedAccessManager<SubjectType>;
};

export function initCollaboratorRoutes<SubjectType extends string>(
  app: Router
) {
  async function getCollaboratorsHandler(
    {
      params: { subjectType, subjectId },
      accessManager,
    }: Request<
      PrismeaiAPI.GetCollaborators.PathParameters,
      PrismeaiAPI.GetCollaborators.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.GetCollaborators.Responses.$200>,
    next: NextFunction
  ) {
    const subject = await accessManager.get(
      subjectType as SubjectType,
      subjectId
    );

    await accessManager.throwUnlessCan(
      ActionType.ManageCollaborators,
      subjectType as SubjectType,
      subject
    );

    const contacts = await fetchCollaboratorContacts({
      ids: Object.keys(subject.collaborators || {}).map(
        (collaboratorId) => collaboratorId
      ),
    });

    const collaborators = await Promise.all(
      Object.entries(subject.collaborators || {}).map(
        async ([collaboratorId, collaborator]) => {
          return {
            ...(collaborator as SubjectCollaborator<Prismeai.Role>),
            id: collaboratorId,
            email:
              contacts.find((cur) => cur.id === collaboratorId)?.email || "",
          };
        }
      )
    );

    return res.send({ result: collaborators });
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
    const collaborators = await fetchCollaboratorContacts({ email });
    if (!collaborators.length) {
      throw new CollaboratorNotFound(
        `Could not find any user corresponding to ${email}`
      );
    }
    const collaborator = collaborators[0];

    const sharedSubject = await accessManager.grant(
      subjectType as SubjectType,
      subjectId,
      collaborator,
      permissions
    );
    return res.send({
      ...(sharedSubject.collaborators?.[<any>collaborator.id] || {}),
      email,
      id: collaborator.id,
    });
  }

  async function revokeCollaborator(
    {
      params: { subjectType, subjectId, collaboratorId },
      accessManager,
    }: Request<
      PrismeaiAPI.RevokeCollaborator.PathParameters,
      PrismeaiAPI.RevokeCollaborator.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.RevokeCollaborator.Responses.$200>,
    next: NextFunction
  ) {
    await accessManager.revoke(<any>subjectType, subjectId, {
      id: collaboratorId,
    });

    return res.send({ id: collaboratorId });
  }

  const asyncRoute =
    (fn: any) => (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

  const baseRoute = "/v2/:subjectType/:subjectId/collaborators";
  app.get(`${baseRoute}`, asyncRoute(getCollaboratorsHandler));
  app.post(`${baseRoute}/share`, asyncRoute(shareHandler));
  app.post(
    `${baseRoute}/revoke/:collaboratorId`,
    asyncRoute(revokeCollaborator)
  );
}
