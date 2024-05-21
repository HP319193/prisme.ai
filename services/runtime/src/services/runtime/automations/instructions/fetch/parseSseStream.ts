import { Broker } from '@prisme.ai/broker';
import { logger } from '../../../../../logger';
import { EventType } from '../../../../../eda';

// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
export interface StreamChunk {
  event?: string;
  data: any[];
  id?: string;
  retry?: number;
  comment?: string;
}

export function processDataSse(chunkData: string): StreamChunk {
  const lines = chunkData.split('\n');
  const chunk: StreamChunk = { data: [] };

  lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return; // Skip empty lines

    if (line.startsWith('data:')) {
      let content = line.slice(5).trim();
      if (content[0] === '[' || content[0] === '{') {
        try {
          content = JSON.parse(content);
        } catch {}
      }
      chunk.data.push(content);
    } else if (line.startsWith('event:')) {
      chunk.event = line.slice(6).trim();
    } else if (line.startsWith('id:')) {
      chunk.id = line.slice(3).trim();
    } else if (line.startsWith('retry:')) {
      chunk.retry = parseInt(line.slice(6));
    } else if (line.startsWith(':')) {
      chunk.comment = line.slice(1).trim();
    } else {
      logger.warn({ msg: 'Invalid SSE chunk line', line });
    }
  });

  return chunk;
}

export async function parseSseStream(
  stream: NodeJS.ReadableStream,
  callback: (_: StreamChunk) => Promise<void>,
  broker: Broker
) {
  let unterminatedLine = ''; // Buffer for unterminated lines across chunks

  for await (const buffer of stream) {
    let str = buffer.toString();
    if (unterminatedLine) {
      str = unterminatedLine + str; // Prepend the unterminated line from the previous chunk
      unterminatedLine = ''; // Clear the buffer
    }

    if (str[0] === '[' || str[0] === '{') {
      try {
        await callback({ data: [JSON.parse(str)] });
      } catch {
        broker
          .send(EventType.Error, {
            error: 'FailedChunkParsing',
            message: 'Could not parse JSON chunk from fetch streamed response',
            chunk: str,
          })
          .catch(logger.error);
      }
      continue;
    }

    if (!str.endsWith('\n')) {
      // If current chunk doesn't end with a newline, expect it to continue in the next chunk
      const lastNewlineIndex = str.lastIndexOf('\n');
      if (lastNewlineIndex !== -1) {
        unterminatedLine = str.slice(lastNewlineIndex + 1);
        str = str.slice(0, lastNewlineIndex + 1);
      } else {
        unterminatedLine = str; // Entire chunk is unterminated
        continue; // Skip processing this chunk until more data arrives
      }
    }

    const chunk = processDataSse(str);
    await callback(chunk);
  }
}
