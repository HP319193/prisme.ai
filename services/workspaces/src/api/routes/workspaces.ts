import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { UPLOADS_MAX_SIZE } from '../../../config';
import { InvalidUploadError, MissingFieldError } from '../../errors';
import { AccessManager } from '../../permissions';
import { AppInstances, Apps, Workspaces } from '../../services';
import { DSULStorage } from '../../services/DSULStorage';
import FileStorage from '../../services/FileStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(
  dsulStorage: DSULStorage,
  uploadsStorage: FileStorage
) {
  const getServices = ({
    context,
    accessManager,
    broker,
    enableCache,
  }: {
    context: PrismeContext;
    accessManager: Required<AccessManager>;
    broker: Broker;
    enableCache?: boolean;
  }) => {
    const workspaces = new Workspaces(
      accessManager,
      broker.child(context),
      dsulStorage,
      enableCache
    );
    return { workspaces };
  };

  async function createWorkspaceHandler(
    {
      context,
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.CreateWorkspace.RequestBody>,
    res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.createWorkspace(body);
    res.send(result);
  }

  async function getWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      query: { version },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.GetWorkspace.PathParameters,
      any,
      any,
      PrismeaiAPI.GetWorkspace.QueryParameters
    >,
    res: Response<PrismeaiAPI.GetWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const apps = new Apps(accessManager, broker.child(context), dsulStorage);
    const appInstances = new AppInstances(
      accessManager,
      broker.child(context),
      dsulStorage,
      apps
    );

    const workspace = await workspaces.getDetailedWorkspace(
      workspaceId,
      version
    );

    const workspaceAppInstances = await appInstances.getDetailedList(
      workspaceId
    );
    workspace.imports = workspaceAppInstances.reduce<
      Record<string, Prismeai.DetailedAppInstance>
    >(
      (appInstances, appInstance) =>
        ({
          ...appInstances,
          [appInstance.slug]: appInstance,
        } as any),
      {} as any
    );
    res.send(workspace);
  }

  async function updateWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateWorkspace.PathParameters,
      any,
      PrismeaiAPI.CreateWorkspace.RequestBody
    >,
    res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.updateWorkspace(workspaceId, body);
    res.send(result);
  }

  async function deleteWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.DeleteWorkspace.PathParameters>,
    res: Response<PrismeaiAPI.DeleteWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    await workspaces.deleteWorkspace(workspaceId);
    await uploadsStorage.deleteWorkspace(accessManager, workspaceId);
    res.send({ id: workspaceId });
  }

  async function getWorkspacesHandler(
    {
      accessManager,
      query,
      context,
      broker,
    }: Request<any, any, any, PrismeaiAPI.GetWorkspaces.QueryParameters>,
    res: Response<PrismeaiAPI.GetWorkspaces.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.findWorkspaces(query);
    res.send(result);
  }

  async function listWorkspaceVersionsHandler(
    {
      accessManager,
      params: { workspaceId },
      context,
      broker,
    }: Request<PrismeaiAPI.ListWorkspaceVersions.PathParameters, any, any, any>,
    res: Response<PrismeaiAPI.ListWorkspaceVersions.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const versions = await workspaces.versions.list(workspaceId);
    res.send(versions);
  }

  async function publishWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId },
      body,
      context,
      broker,
    }: Request<
      PrismeaiAPI.PublishWorkspaceVersion.PathParameters,
      any,
      PrismeaiAPI.PublishWorkspaceVersion.RequestBody,
      any
    >,
    res: Response<PrismeaiAPI.PublishWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const version = await workspaces.versions.publish(workspaceId, body);
    res.send(version);
  }

  async function deleteWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.DeleteWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.DeleteWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    await workspaces.versions.delete(workspaceId, versionId);
    res.send({ id: versionId });
  }

  async function pullWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.PullWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.PullWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const version = await workspaces.versions.pull(workspaceId, versionId);

    res.send(version);
  }

  async function duplicateWorkspaceHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.DuplicateWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.DuplicateWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const workspace = await workspaces.duplicateWorkspace(
      workspaceId,
      versionId
    );

    res.send(workspace);
  }

  async function exportWorkspaceHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      query,
      context,
      broker,
    }: Request<PrismeaiAPI.ExportWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.ExportWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    // Tar is also supported by underlying archiver package, but not by import package (yauzl)
    const format: string = 'zip';
    res.setHeader(
      'Content-disposition',
      `attachment; filename=${workspaceId}-${versionId || 'current'}.${format}`
    );
    res.setHeader('Content-type', 'application/octet-stream');
    await workspaces.exportWorkspace(workspaceId, versionId, format, res);
  }

  async function exportMultipleWorkspacesHandler(
    {
      accessManager,
      body,
      context,
      broker,
    }: Request<any, any, PrismeaiAPI.ExportMultipleWorkspaces.RequestBody>,
    res: Response<PrismeaiAPI.ExportMultipleWorkspaces.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    // Tar is also supported by underlying archiver package, but not by import package (yauzl)
    const format: string = 'zip';
    res.setHeader(
      'Content-disposition',
      `attachment; filename=bulk-export.${format}`
    );
    res.setHeader('Content-type', 'application/octet-stream');
    await workspaces.exportMultipleWorkspaces(body, res);
  }

  async function importWorkspaceHandler(
    {
      context,
      body,
      file,
      params: { workspaceId },
      broker,
      accessManager,
    }: Request<PrismeaiAPI.ImportExistingWorkspace.PathParameters, any>,
    res: Response<PrismeaiAPI.ImportExistingWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
      // Without cache, many redundant requests make imports much longer & resource consuming
      enableCache: true,
    });
    if (!file?.buffer) {
      throw new MissingFieldError('Missing archive');
    }

    const result = await workspaces.importArchive(file?.buffer, workspaceId);
    res.send(result);
  }

  const app = express.Router();

  app.post(`/`, asyncRoute(createWorkspaceHandler));
  app.patch(`/:workspaceId`, asyncRoute(updateWorkspaceHandler));
  app.get(`/`, asyncRoute(getWorkspacesHandler));
  app.delete(`/:workspaceId`, asyncRoute(deleteWorkspaceHandler));
  app.get(`/:workspaceId`, asyncRoute(getWorkspaceHandler));

  app.get(`/:workspaceId/versions`, asyncRoute(listWorkspaceVersionsHandler));
  app.post(
    `/:workspaceId/versions`,
    asyncRoute(publishWorkspaceVersionHandler)
  );
  app.delete(
    `/:workspaceId/versions/:versionId`,
    asyncRoute(deleteWorkspaceVersionHandler)
  );
  app.post(
    `/:workspaceId/versions/:versionId/rollback`,
    asyncRoute(pullWorkspaceVersionHandler)
  );
  app.post(
    `/:workspaceId/versions/:versionId/duplicate`,
    asyncRoute(duplicateWorkspaceHandler)
  );

  app.post(
    `/:workspaceId/versions/:versionId/export`,
    asyncRoute(exportWorkspaceHandler)
  );
  app.post(`/export`, asyncRoute(exportMultipleWorkspacesHandler));

  const upload = multer({
    limits: {
      fileSize: UPLOADS_MAX_SIZE,
    },
    fileFilter: (req, file, callback) => {
      const allowedExts = ['.zip', '.x-zip-compressed'];
      const ext = path.extname(file.originalname);
      if (!allowedExts.includes(ext)) {
        return callback(
          new InvalidUploadError(
            `Invalid uploaded file '${
              file.originalname
            }' : extension must be one of ${allowedExts.join(', ')}`
          )
        );
      }
      callback(null, true);
    },
  });
  app.post(
    `/import`,
    upload.single('archive'),
    asyncRoute(importWorkspaceHandler)
  );
  app.post(
    `/:workspaceId/import`,
    upload.single('archive'),
    asyncRoute(importWorkspaceHandler)
  );

  return app;
}
