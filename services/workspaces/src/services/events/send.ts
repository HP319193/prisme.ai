import { Broker, PrismeEvent } from "@prisme.ai/broker";
import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";

const sendEvent =
  (logger: Logger, ctx: PrismeContext, broker: Broker) =>
  async (event: Pick<PrismeEvent, "type" | "payload">) => {
    logger.info("Send event ", event.type);
    return await broker.send(event.type, event.payload);
  };

export { sendEvent };
export default sendEvent;
