import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import Runtime from '../../services/runtime';
import { asyncRoute } from '../utils/async';
import { UPLOADS_MAX_SIZE } from '../../../config';
import { InvalidUploadError } from '../../errors';

export default function init(runtime: Runtime) {
  async function webhookHandler(
    req: Request<PrismeaiAPI.AutomationWebhook.PathParameters>,
    res: Response<PrismeaiAPI.AutomationWebhook.Responses.$200>
  ) {
    const {
      headers,
      method,
      query,
      context,
      files,
      logger,
      params: { workspaceId, automationSlug },
      body,
      broker,
    } = req;
    const DO_NOT_SEND_HEADERS = ['cookie', 'host'];
    const WHITELIST_HEADERS = ['x-prismeai-workspace-id'];
    const filteredHeaders = Object.entries(headers)
      .filter(
        ([k, v]) =>
          WHITELIST_HEADERS.includes(k) ||
          (!k.toLowerCase().startsWith('x-') &&
            !DO_NOT_SEND_HEADERS.includes(k))
      )
      .reduce(
        (obj, [k, v]) => ({
          ...obj,
          [k]: v,
        }),
        {}
      );

    const filesBody = Array.isArray(files)
      ? files
          ?.map((cur) => (cur.fieldname ? cur : { ...cur, fieldname: 'file' }))
          .reduce(
            (body, { fieldname, buffer, ...file }) => ({
              ...body,
              [fieldname]: {
                ...file,
                base64: buffer.toString('base64'),
              },
            }),
            {}
          )
      : files;

    const outputs = await runtime.triggerWebhook(
      {
        workspaceId,
        automationSlug: decodeURIComponent(automationSlug),
        body: {
          ...body,
          ...filesBody,
        },
        headers: filteredHeaders,
        method,
        query,
      },
      context,
      logger,
      broker
    );
    res.send(outputs?.[0]?.output || {});
  }

  const app = express.Router({ mergeParams: true });

  const upload = multer({
    limits: {
      fieldSize: 1024 * 1024, // 10KB
      fileSize: UPLOADS_MAX_SIZE,
      parts: 50,
    },
  }).any();
  const uploadValidation = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.message.includes('File too large')) {
          return next(new InvalidUploadError(UPLOADS_MAX_SIZE));
        }
      }
      next();
    });
  };
  app.use(`/:automationSlug`, uploadValidation, asyncRoute(webhookHandler));

  return app;
}
