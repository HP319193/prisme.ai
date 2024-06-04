import fs from 'fs';
import { writeHeapSnapshot } from 'v8';
import { HEAPDUMPS_DIRECTORY } from '../../../config';
import { logger, Logger } from '../../logger';
import { throttle } from '../../utils/throttle';

let heapdumpsDirectory = HEAPDUMPS_DIRECTORY;
try {
  fs.mkdirSync(HEAPDUMPS_DIRECTORY, { recursive: true });
} catch (error) {
  logger.error(
    `Could not create heapdump '${HEAPDUMPS_DIRECTORY}' directory : ${error} `
  );
  heapdumpsDirectory = '.';
}

export const unthrottledHeapdump = (logger: Logger) => async () => {
  const filepath = `${heapdumpsDirectory}/heapdump-${Date.now()}`;
  writeHeapSnapshot(filepath);
  logger.info('Heapdump written to', filepath);
};

export const heapdump = throttle(unthrottledHeapdump, 60 * 1000, {
  defaultReturn: () => undefined,
});
