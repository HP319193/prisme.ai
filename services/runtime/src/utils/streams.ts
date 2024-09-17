import { Readable } from 'stream';
import { logger } from '../logger';

export type ChunkHandler<T = any> = (chunk: T) => any;

export class ReadableStream<T> extends Readable {
  callback?: ChunkHandler<T>;

  constructor(callback?: ChunkHandler, objectMode: boolean = false) {
    super({ objectMode: objectMode });
    this.callback = callback;

    this.on('data', (chunk: any) => {
      if (!objectMode) {
        try {
          chunk = JSON.parse(chunk);
        } catch {}
      }

      try {
        if (this.callback) {
          this.callback(chunk);
        }
      } catch (err) {
        logger.error({
          msg: `An error occured while passing ReadableStream chunk to parent callback`,
          err,
        });
      }
    });
  }

  _read(): void {
    return;
  }
}
