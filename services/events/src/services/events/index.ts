import { PrismeContext } from '../../api/middlewares';
import { broker } from '../../eda';
import { Logger } from '../../logger';

import sendEvent from './send';

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleLogger = logger.child({ module: 'workspaces' });
  const moduleBroker = broker.child(ctx);

  return {
    sendEvent: sendEvent(moduleLogger, ctx, moduleBroker),
  };
};
