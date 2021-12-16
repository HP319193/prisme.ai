import { PrismeEvent } from "@prisme.ai/broker";
import express, { Request, Response } from "express";
import services from "../../services";
import { asyncRoute } from "../utils/async";

// TODO replace with common http interface package
interface SendEventRequestBody {
  events: PrismeEvent[];
}

async function sendEventHandler(
  { logger, context, body }: Request,
  res: Response
) {
  const request = body as SendEventRequestBody;

  const workspaces = services.events(logger, context);

  const result = await Promise.all(request.events.map(workspaces.sendEvent));
  res.send(result);
}

const app = express.Router();

app.post(`/`, asyncRoute(sendEventHandler));

export default app;
