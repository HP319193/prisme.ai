import { Readable } from 'stream';
import { logger } from '../logger';

export type ChunkHandler<T = any> = (chunk: T) => any;

export class ReadableStream<T> extends Readable {
  callback: ChunkHandler<T>;

  constructor(callback: ChunkHandler) {
    super();
    this.callback = callback;

    this.on('data', (chunk: any) => {
      try {
        chunk = JSON.parse(chunk);
      } catch {}

      try {
        this.callback(chunk);
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
