import fs from "fs";
import { default as dump } from "heapdump";
import { HEAPDUMPS_DIRECTORY } from "../../../config";
import { logger, Logger } from "../../logger";
import { throttle } from "../../utils/throttle";

let heapdumpsDirectory = HEAPDUMPS_DIRECTORY;
try {
  fs.mkdirSync(HEAPDUMPS_DIRECTORY, { recursive: true });
} catch (error) {
  logger.error(
    `Could not create heapdump '${HEAPDUMPS_DIRECTORY}' directory : ${error} `
  );
  heapdumpsDirectory = ".";
}

export const unthrottledHeapdump = (logger: Logger) => async () => {
  dump.writeSnapshot(
    `${heapdumpsDirectory}/heapdump-${Date.now()}`,
    (err, filename) => {
      logger.info("Heapdump written to", filename);
    }
  );
};

export const heapdump = throttle(unthrottledHeapdump, 60 * 1000, {
  defaultReturn: () => undefined,
});
