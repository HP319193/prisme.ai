import FileStorage from '../FileStorage';
import { AccessManager, getSuperAdmin } from '../../permissions';
import { logger } from '../../logger';

export async function autoremoveExpiredUploads(
  uploadsStorage: FileStorage,
  accessManager: AccessManager
) {
  logger.info('Auto removing expired uploads ...');

  const authorizedAccessManager = await getSuperAdmin(accessManager);
  const uploads = await uploadsStorage.deleteMany(authorizedAccessManager, {
    expiresAt: { $lt: new Date().toISOString() },
  });

  logger.info(`Removed ${uploads.length} outdated uploads ...`);
}
