import { Broker } from '@prisme.ai/broker';
import { AccessManager, SubjectType } from '../../../permissions';
import { DSULStorage, DSULType } from '../../DSULStorage';
import { Logger, logger as globalLogger } from '../../../logger';
import { InvalidVersionError } from '../../../errors';

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

  getWorkspace = async (workspaceId: string, version?: string) => {
    const metadata = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    if (
      version &&
      version !== 'current' &&
      !(metadata.versions || []).some((cur) => cur.name == version)
    ) {
      throw new InvalidVersionError(`Unknown version name '${version}'`);
    }
    return await this.getWorkspaceAsAdmin(workspaceId, version);
  };

  getWorkspaceAsAdmin = async (workspaceId: string, version?: string) => {
    const { id: _, ...workspace } = await this.storage.get({
      workspaceId,
      version: version || 'current',
    });
    return { id: workspaceId, ...workspace };
  };
}
