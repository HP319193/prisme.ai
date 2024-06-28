import express, { NextFunction, Request, Response } from 'express';
import { asyncRoute } from '../utils/async';
import multer from 'multer';
import FileStorage, { FileUploadRequest } from '../../services/FileStorage';
import { UPLOADS_DEFAULT_VISIBILITY } from '../../../config';
import {
  AccessManager,
  ActionType,
  SubjectType,
  getSuperAdmin,
} from '../../permissions';
import { temporaryToken, validateTemporaryToken } from '../../utils';
import { PrismeError } from '../../errors';

export default function init(fileStorage: FileStorage) {
  async function uploadFileHandler(
    {
      context,
      body,
      files = [],
      params: { workspaceId },
      accessManager,
    }: Request<
      PrismeaiAPI.UploadFile.PathParameters,
      any,
      PrismeaiAPI.UploadFile.RequestBody
    >,
    res: Response<PrismeaiAPI.UploadFile.Responses.$200>
  ) {
    body.metadata = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        (files as any[]).push(parseDataURI(value));
        delete body[key];
      } else if (key.startsWith('metadata.')) {
        const metaKey = key.slice('metadata.'.length);
        if (!(metaKey in body.metadata)) {
          body.metadata[metaKey] = value;
        } else if (!Array.isArray(body.metadata[metaKey])) {
          body.metadata[metaKey] = [body.metadata[metaKey], value];
        } else {
          body.metadata[metaKey] = body.metadata[metaKey].concat([value]);
        }
        delete body[key];
      }
    }

    // Note that true / false are inverted here, as we explicitly check for any value !== defaultPublic, meaning it's public
    const defaultPublic =
      UPLOADS_DEFAULT_VISIBILITY === 'private' ? 'true' : 'false';
    const fileUploadRequests: FileUploadRequest[] = (
      (files as Express.Multer.File[]) || []
    ).map(({ size, originalname: name, buffer, mimetype }, idx) => {
      const {
        expiresAfter,
        public: publicFile,
        shareToken,
        metadata,
      } = body || {};

      return {
        name,
        buffer,
        size,
        mimetype,
        expiresAfter: Array.isArray(expiresAfter)
          ? parseInt(expiresAfter[idx] || '0')
          : parseInt(expiresAfter || '0'),
        public: Array.isArray(publicFile)
          ? publicFile[idx] !== defaultPublic
          : publicFile !== defaultPublic,
        shareToken,
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

  async function updateFileHandler(
    {
      context,
      body,
      params: { id },
      accessManager,
    }: Request<PrismeaiAPI.GetFile.PathParameters>,
    res: Response<PrismeaiAPI.GetFile.Responses.$200>
  ) {
    const result = await fileStorage.updateFile(
      accessManager,
      id,
      body,
      context?.http?.baseUrl!
    );

    res.send(result);
  }

  async function listFilesHandler(
    {
      context,
      accessManager,
      params: { workspaceId },
      query: { limit, page, sort = '-createdAt', ...query },
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
        sort,
      }
    );
    res.send(result);
  }

  async function shareFileHandler(
    {
      context,
      body,
      params: { id },
      accessManager,
    }: Request<
      PrismeaiAPI.ShareFile.PathParameters,
      any,
      PrismeaiAPI.ShareFile.RequestBody
    >,
    res: Response<PrismeaiAPI.ShareFile.Responses.$200>
  ) {
    let file = await fileStorage.get(
      accessManager,
      {
        $or: [{ id }, { path: id }],
      },
      context?.http?.baseUrl!
    );
    if (!file.shareToken) {
      file = (await fileStorage.updateFile(
        accessManager,
        file.id,
        {
          shareToken: true as any,
        },
        context?.http?.baseUrl!
      )) as any;
    }
    if (!file.shareToken) {
      throw new PrismeError(
        'Unexpected error occured : could not generate a share url',
        {}
      );
    }
    const expiresIn = (body.expiresIn || 60) * 1000; // Default to 1min
    const expiresAt = Date.now() + expiresIn;
    const { token } = await temporaryToken(
      file.shareToken,
      expiresAt,
      file.createdAt
    );

    res.send({
      url: `${file.url}?token=${token}`,
      expiresAt: new Date(expiresAt).toISOString(),
      expiresIn: expiresIn / 1000,
    });
  }

  const app = express.Router({ mergeParams: true });

  const upload = multer();
  app.post(`/`, upload.any(), asyncRoute(uploadFileHandler));
  app.patch(`/:id`, asyncRoute(updateFileHandler));
  app.delete(`/:id`, asyncRoute(deleteFileHandler));
  app.get(`/`, asyncRoute(listFilesHandler));
  app.get(`/:id`, asyncRoute(getFileHandler));
  app.post(`/:id/share`, asyncRoute(shareFileHandler));

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

export function initDownloadProxy(
  baseAccessManager: AccessManager,
  fileStorage: FileStorage
) {
  let authorizedAccessManager: Required<AccessManager>;
  getSuperAdmin(baseAccessManager).then(
    (superAdmin) => (authorizedAccessManager = superAdmin)
  );

  return asyncRoute(async function download(
    req: Request<PrismeaiAPI.GetFile.PathParameters>,
    res: Response<PrismeaiAPI.GetFile.Responses.$200>,
    next: NextFunction
  ) {
    const path: string | { $in: string[] } =
      req.path[0] === '/' ? req.path.slice(1) : req.path;
    const file = await fileStorage.get(
      authorizedAccessManager,
      {
        path:
          decodeURIComponent(path) !== path
            ? {
                $in: [path, decodeURIComponent(path)],
              }
            : path,
      },
      req.context?.http?.baseUrl!
    );

    if (
      !req.query.token ||
      !file.shareToken ||
      req.query.token !== file.shareToken
    ) {
      const isTemporaryToken =
        file.shareToken &&
        file.createdAt &&
        req.query.token &&
        (await validateTemporaryToken(
          file.shareToken!,
          file.createdAt,
          req.query.token as string
        ));
      if (!isTemporaryToken) {
        await req.accessManager.throwUnlessCan(
          ActionType.Read,
          SubjectType.File,
          file
        );
      }
    }

    if (file.mimetype) {
      res.setHeader('content-type', file.mimetype);
    }
    await fileStorage.download(file.path, res);
  });
}
