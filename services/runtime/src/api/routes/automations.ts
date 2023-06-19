import express, { Request, Response } from 'express';
import multer from 'multer';
import { ActionType, SubjectType } from '../../permissions';
import Runtime from '../../services/runtime';
import { asyncRoute } from '../utils/async';

export default function init(runtime: Runtime) {
  async function testHandler(
    req: Request<PrismeaiAPI.TestAutomation.PathParameters>,
    res: Response<PrismeaiAPI.TestAutomation.Responses.$200>
  ) {
    const {
      context,
      files,
      logger,
      params: { automationSlug },
      body: { payload },
      broker,
      accessManager,
    } = req;

    await accessManager.throwUnlessCan(
      ActionType.Test,
      SubjectType.Automation,
      { runningWorkspaceId: context.workspaceId } as any
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

    const outputs = await runtime.testAutomation(
      decodeURIComponent(automationSlug),
      {
        ...payload,
        ...filesBody,
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
  app.post(`/:automationSlug`, upload.any(), asyncRoute(testHandler));

  return app;
}
