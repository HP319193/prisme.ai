import express, { Request, Response } from 'express';
import multer from 'multer';
import { EventType } from '../../eda';
import Runtime from '../../services/runtime';
import { asyncRoute } from '../utils/async';

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
    const filteredHeaders = Object.entries(headers)
      .filter(
        ([k, v]) =>
          !k.toLowerCase().startsWith('x-') && !DO_NOT_SEND_HEADERS.includes(k)
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
      fieldSize: 1024, // 1KB
      fileSize: 500 * 1024, // 500KB
      files: 1,
      parts: 50,
    },
  });
  app.use(`/:automationSlug`, upload.any(), asyncRoute(webhookHandler));

  return app;
}
