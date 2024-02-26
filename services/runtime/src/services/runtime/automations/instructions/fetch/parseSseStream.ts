import { Broker } from '@prisme.ai/broker';
import { logger } from '../../../../../logger';
import { EventType } from '../../../../../eda';

// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
export interface StreamChunk {
  event?: string;
  data: any[];
  id?: string;
  retry?: number;
}

export async function parseSseStream(
  stream: NodeJS.ReadableStream,
  callback: (_: StreamChunk) => Promise<void>,
  broker: Broker
) {
  let unterminatedLine = '';

  for await (const buffer of stream) {
    const str = buffer.toString();
    // No stream : entire json response is given at once
    if (str[0] === '[' || str[0] === '{') {
      try {
        return callback({
          data: [JSON.parse(str)],
        });
      } catch {
        broker
          .send(EventType.Error, {
            error: 'FailedChunkParsing',
            message: 'Could not parse JSON chunk from fetch streamed response',
            chunk: str,
          })
          .catch(logger.error);
      }
    }
    const lines = str.split('\n\n');
    // If received chunk is not \n terminated, this means it will be ended with next chunk
    if (!str.endsWith('\n')) {
      unterminatedLine += lines.pop();
    } else if (unterminatedLine.length && lines.length) {
      lines[0] = unterminatedLine + lines[0].trim();
      unterminatedLine = '';
    }
    const chunk: StreamChunk = lines.reduce<StreamChunk>(
      (chunk, line) => {
        line = line.trim();
        if (line.startsWith('data:')) {
          let content = line.slice(5).trim();
          if (content[0] == '[' || content[0] == '{') {
            try {
              content = JSON.parse(content);
            } catch {}
          }
          chunk.data.push(content);
        } else if (line.startsWith('event:')) {
          chunk.event = line.slice(6);
        } else if (line.startsWith('id:')) {
          chunk.id = line.slice(3);
        } else if (line.startsWith('retry:')) {
          chunk.retry = parseInt(line.slice(6));
        } else if (line.length) {
          logger.warn({ msg: 'Invalid SSE chunk line', line });
        }
        return chunk;
      },
      { data: [] }
    );
    await callback(chunk);
  }
}
