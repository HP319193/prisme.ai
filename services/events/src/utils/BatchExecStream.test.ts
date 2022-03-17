import BatchExecStream, { BatchExecStreamOptions } from './BatchExecStream';

const streams: BatchExecStream<Chunk>[] = [];
const getStream = (opts: BatchExecStreamOptions<Chunk>) => {
  const stream = new BatchExecStream<Chunk>({ flushEvery: 1000, ...opts });
  streams.push(stream);
  return stream;
};

const sleep = async (min: number, max?: number) => {
  return new Promise((resolve) => {
    const delay = max ? Math.round(Math.random() * max) + min : min;
    setTimeout(resolve, delay);
  });
};

interface Chunk {
  type: string;
  id: string;
}

const generateChunks = (
  type: string | string[],
  min: number,
  max?: number
): Chunk[] => {
  const count = max ? Math.round(Math.random() * max) + min : min;
  return Array.apply(null, Array(count))
    .map(() => ({
      type: Array.isArray(type)
        ? type[Math.floor(Math.random() * type.length)]
        : type,
      id: `${Math.round(Math.random() * 10000000)}`,
    }))
    .sort(() => 0.5 - Math.random()); // shuffle
};

const sendChunks = async (chunks: Chunk[], stream: BatchExecStream<Chunk>) => {
  for (let i = 0; i < chunks.length; i++) {
    await stream.writeAndWait(chunks[i]);
  }
};

const verifyReceivedChunks = (receivedChunks: Chunk[], sentChunks: Chunk[]) => {
  expect(receivedChunks.length).toBe(sentChunks.length);
  expect(receivedChunks.map(({ id, type }) => `${type}-${id}`).sort()).toEqual(
    sentChunks.map(({ id, type }) => `${type}-${id}`).sort()
  );
};

describe('When flushing is faster than writting', () => {
  it('Should flush as many chunks as given (all in a row)', async () => {
    const willSend: Chunk[] = generateChunks(['one', 'two'], 200, 1000);
    const received: Chunk[] = [];

    const stream = getStream({
      flushEvery: 200,
      bulkExec: (chunks) => {
        received.push(...chunks);
      },
    });
    await sendChunks(willSend, stream);
    await sleep(300);

    verifyReceivedChunks(received, willSend);
  });

  it('An exception raised during a flush should move processed chunks back to queue', async () => {
    const willSend: Chunk[] = generateChunks('one', 2).concat(
      generateChunks('two', 4)
    );
    const received: Chunk[] = [];

    let flushNb = 0;
    const stream = getStream({
      flushEvery: 200,
      highWaterMark: 4,
      flushAt: 2, // Will trigger 3 flushes
      bulkExec: (chunks) => {
        flushNb++;
        if (flushNb == 2) {
          // 3rd & 4th chunks will be pushed back
          throw new Error();
        }
        received.push(...chunks);
      },
    });
    await sendChunks(willSend, stream);
    stream.end();
    await stream.onClosed();
    await sleep(400); // onClosed occasionally returns while last chunks are still flushing :(

    verifyReceivedChunks(received, willSend);
  });
});

describe('When flushing is slower than writting', () => {
  it('Should flush as many chunks as given (all in a row)', async () => {
    const willSend: Chunk[] = generateChunks('one', 200, 300).concat(
      generateChunks('two', 20, 100)
    );
    const received: Chunk[] = [];

    const stream = getStream({
      flushEvery: 300,
      highWaterMark: 50,
      flushAt: 20,
      bulkExec: async (chunks) => {
        received.push(...chunks);
        await sleep(20, 100);
      },
    });
    await sendChunks(willSend, stream);
    stream.end();
    await stream.onClosed();
    await sleep(400); // onClosed occasionally returns while last chunks are still flushing :(

    verifyReceivedChunks(received, willSend);
  });

  it('An exception raised during a flush should move processed chunks back to queue', async () => {
    const willSend: Chunk[] = generateChunks('one', 200, 300).concat(
      generateChunks('two', 20, 100)
    );
    const received: Chunk[] = [];

    let closed = false;
    const stream = getStream({
      flushEvery: 300,
      highWaterMark: 50,
      flushAt: 20,
      bulkExec: async (chunks) => {
        // Stop sending error on stream closing as we cannot try push them back anymore & it would make the test fail
        if (!closed && Math.random() > 0.7) {
          throw new Error();
        }
        received.push(...chunks);
        await sleep(20, 100);
      },
    });
    await sendChunks(willSend, stream);
    stream.end();
    closed = true;
    await stream.onClosed();
    // await sleep(400); // onClosed occasionally returns while last chunks are still flushing :(

    verifyReceivedChunks(received, willSend);
  });
});

afterAll(async () => {
  return Promise.all(
    streams.map((cur) => {
      if (cur.writableEnded) {
        return Promise.resolve();
      }
      cur.end();
      return cur.onClosed();
    })
  );
});
