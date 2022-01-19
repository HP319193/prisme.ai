import { Broker } from "@prisme.ai/broker";
import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";

const sendEvent =
  (logger: Logger, ctx: PrismeContext, broker: Broker) =>
  async (event: { type: string; payload?: any }) => {
    logger.debug({ msg: "Send event ", event });
    return await broker.send(event.type, event.payload || {});
  };

export { sendEvent };
export default sendEvent;
