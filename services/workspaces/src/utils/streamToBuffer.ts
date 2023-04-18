import stream from 'stream';
import { ObjectNotFoundError } from '../errors';

export async function streamToBuffer(stream: stream.Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on('readable', function (buffer: Buffer) {
      for (;;) {
        let buffer = stream.read();
        if (!buffer) {
          break;
        }
        buffers.push(buffer);
      }
    });

    stream.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        reject(new ObjectNotFoundError());
      } else {
        reject(err);
      }
    });
    stream.on('error', function (err) {
      reject(err);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}
