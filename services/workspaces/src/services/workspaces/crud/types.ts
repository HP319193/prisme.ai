import { Broker } from '@prisme.ai/broker';
import { AccessManager } from '../../../permissions';
import { DSULStorage, DSULType } from '../../DSULStorage';
import { Logger, logger as globalLogger } from '../../../logger';

export class DsulCrud {
  protected accessManager: Required<AccessManager>;
  protected broker: Broker;
  protected storage: DSULStorage<DSULType.DSULIndex>;
  protected logger: Logger;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage,
    logger?: Logger,
    enableCache?: boolean
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = storage.child(DSULType.DSULIndex, {}, enableCache);
    this.logger = logger || globalLogger;
  }
}
