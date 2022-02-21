export * from './types';

import { StoreDriverOptions, StoreDriverType } from './types';
import { ElasticsearchStore } from './ElasticsearchStore';
import { ConfigurationError } from '../../../errors';

export function buildEventsStore(opts: StoreDriverOptions) {
  switch (opts.driver) {
    case StoreDriverType.Elasticsearch:
      const driver = new ElasticsearchStore(opts);
      return driver;
    default:
      throw new ConfigurationError(`Invalid Users storage "${opts.driver}"`, {
        storage: opts.driver,
      });
  }
}
