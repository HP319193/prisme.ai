import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import Runtime, { WehookChunkOutput } from '../../services/runtime';
import { asyncRoute } from '../utils/async';
import { ReadableStream } from '../../utils';
import { UPLOADS_MAX_SIZE, WEBHOOKS_SSE_KEEPALIVE } from '../../../config';
import { InvalidUploadError } from '../../errors';
import { EventType } from '../../eda';
import { errorHttpStatus } from '../middlewares/errors';

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
              [fieldname]: !(<any>body)?.[fieldname]
                ? {
                    ...file,
                    base64: buffer.toString('base64'),
                  }
                : [
                    (<any>body)[fieldname],
                    {
                      ...file,
                      base64: buffer.toString('base64'),
                    },
                  ],
            }),
            {}
          )
      : files;

    let sseInitialized = false;
    let statusCode = 200;
    let sseKeepAliveTimer: NodeJS.Timer;
    const initSSE = () => {
      res.setHeader('content-type', 'text/event-stream');
      res.setHeader('cache-control', 'no-cache');
      res.setHeader('connection', 'keep-alive');
      res.flushHeaders();
      sseInitialized = true;
    };
    const outputBuffer = new ReadableStream<WehookChunkOutput>((chunk) => {
      if (Object.keys(chunk?.headers || {}).length) {
        Object.entries(chunk?.headers).forEach(([k, v]) => {
          res.setHeader(k, v as string);
        });
      }
      if (chunk?.chunk) {
        if (!sseInitialized) {
          initSSE();
        }
        res.write('data: ' + JSON.stringify(chunk?.chunk) + '\n\n');
      }
      if (chunk?.status) {
        statusCode = chunk?.status;
      }
      if (chunk?.sseKeepAlive) {
        if (!sseInitialized) {
          initSSE();
        }
        sseKeepAliveTimer = setInterval(
          () => {
            res.write('data: {"keepAlive": true}\n\n');
          },
          chunk?.sseKeepAlive < WEBHOOKS_SSE_KEEPALIVE
            ? WEBHOOKS_SSE_KEEPALIVE
            : chunk.sseKeepAlive
        );
      }
    });

    let output: any;
    function endWebhook(error?: any) {
      if (error) {
        output = error;
        res.status(errorHttpStatus(error as Error, false));
      } else {
        res.status(statusCode);
      }
      try {
        if (sseKeepAliveTimer) {
          clearInterval(sseKeepAliveTimer);
        }

        if (!sseInitialized) {
          res.send(output);
        } else {
          if (JSON.stringify(output) != '{}') {
            res.write('data: ' + JSON.stringify(output) + '\n\n');
          }
          res.end();
        }
      } catch {}
    }
    outputBuffer.on('end', endWebhook);

    try {
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
          $http: outputBuffer,
        },
        context,
        logger,
        broker
      );
      output = outputs?.[0]?.output || {};
      outputBuffer.push(null);
    } catch (err) {
      broker.send(EventType.Error, err as Error);
      endWebhook(err);
    }
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
