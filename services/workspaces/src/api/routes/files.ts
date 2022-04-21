import express, { Request, Response } from 'express';
import { asyncRoute } from '../utils/async';
import multer from 'multer';
import FileStorage from '../../services/FileStorage';

export default function init(fileStorage: FileStorage) {
  async function uploadFileHandler(
    {
      context,
      files,
      params: { workspaceId },
      accessManager,
    }: Request<PrismeaiAPI.ListFiles.PathParameters, any>,
    res: Response<PrismeaiAPI.ListFiles.Responses.$200>
  ) {
    const result = await fileStorage.upload(
      accessManager,
      workspaceId,
      context?.http?.baseUrl!,
      (files || []) as Express.Multer.File[]
    );
    res.send(result);
  }

  async function getFileHandler(
    {
      context,
      params: { id },
      accessManager,
    }: Request<PrismeaiAPI.GetFile.PathParameters>,
    res: Response<PrismeaiAPI.GetFile.Responses.$200>
  ) {
    const result = await fileStorage.get(
      accessManager,
      {
        $or: [{ id }, { path: id }],
      },
      context?.http?.baseUrl!
    );
    res.send(result);
  }

  async function deleteFileHandler(
    {
      params: { id },
      accessManager,
    }: Request<PrismeaiAPI.DeleteFile.PathParameters>,
    res: Response<PrismeaiAPI.DeleteFile.Responses.$200>
  ) {
    await fileStorage.delete(accessManager, {
      $or: [{ id }, { path: id }],
    });
    res.send({ id });
  }

  async function listFilesHandler(
    {
      context,
      accessManager,
      params: { workspaceId },
      query: { limit, page, ...query },
    }: Request<any, any, any, PrismeaiAPI.ListFiles.QueryParameters>,
    res: Response<PrismeaiAPI.ListFiles.Responses.$200>
  ) {
    const result = await fileStorage.list(
      accessManager,
      workspaceId,
      context?.http?.baseUrl!,
      query,
      {
        pagination: {
          limit,
          page,
        },
      }
    );
    res.send(result);
  }

  const app = express.Router({ mergeParams: true });

  const upload = multer();
  app.post(`/`, upload.single('file'), asyncRoute(uploadFileHandler));
  app.delete(`/:id`, asyncRoute(deleteFileHandler));
  app.get(`/`, asyncRoute(listFilesHandler));
  app.get(`/:id`, asyncRoute(getFileHandler));

  return app;
}
