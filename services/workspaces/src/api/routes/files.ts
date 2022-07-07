import express, { Request, Response } from 'express';
import { asyncRoute } from '../utils/async';
import multer from 'multer';
import FileStorage, { FileUploadRequest } from '../../services/FileStorage';

export default function init(fileStorage: FileStorage) {
  async function uploadFileHandler(
    {
      context,
      body,
      files = [],
      params: { workspaceId },
      accessManager,
    }: Request<PrismeaiAPI.ListFiles.PathParameters, any>,
    res: Response<PrismeaiAPI.ListFiles.Responses.$200>
  ) {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        (files as any[]).push(parseDataURI(value));
        delete body[key];
      }
    }

    const fileUploadRequests: FileUploadRequest[] = (
      (files as Express.Multer.File[]) || []
    ).map(({ size, originalname: name, buffer, mimetype }, idx) => {
      const { expiresAfter, ...metadata } = body || {};

      return {
        name,
        buffer,
        size,
        mimetype,
        expiresAfter: Array.isArray(expiresAfter)
          ? expiresAfter[idx]
          : expiresAfter,
        metadata: Object.entries(metadata)
          .filter(([k, v]) => !Array.isArray(v) || v.length > idx)
          .reduce(
            (obj, [k, v]) => ({
              ...obj,
              [k]: Array.isArray(v) ? v[idx] : v,
            }),
            {}
          ),
      };
    });

    const result = await fileStorage.upload(
      accessManager,
      workspaceId,
      context?.http?.baseUrl!,
      fileUploadRequests
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
      context?.http?.baseUrl!,
      {
        ...query,
        workspaceId,
      },
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
  app.post(`/`, upload.any(), asyncRoute(uploadFileHandler));
  app.delete(`/:id`, asyncRoute(deleteFileHandler));
  app.get(`/`, asyncRoute(listFilesHandler));
  app.get(`/:id`, asyncRoute(getFileHandler));

  return app;
}

function parseDataURI(uri: string) {
  if (!uri.startsWith('data:')) {
    return;
  }
  uri = uri.slice(5);
  const split = uri.split(';').map((cur) => cur.trim());
  if (split.length < 3) {
    return;
  }
  const mimetype = split[0];
  const originalname = split[1].startsWith('filename:')
    ? split[1].slice(9)
    : split[1];
  const base64 = split[2].startsWith('base64,') ? split[2].slice(7) : split[2];

  const buffer = Buffer.from(base64, 'base64');
  return {
    size: buffer.length,
    originalname,
    buffer,
    mimetype,
  };
}
