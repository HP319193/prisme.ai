import { PrismeContext } from '../../api/middlewares';
import { Logger } from '../../logger';

import { heapdump } from './heapdump';
import { changeLogLevel } from './logging';
import { healthcheck } from './healthcheck';

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleLogger = logger.child({ module: 'sys' });
  return {
    healthcheck: healthcheck(moduleLogger),
    changeLogLevel: changeLogLevel(moduleLogger),
    heapdump: heapdump(moduleLogger, ctx),
  };
};
