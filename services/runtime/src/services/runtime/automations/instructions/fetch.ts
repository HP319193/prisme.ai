import { URL, URLSearchParams } from 'url';
import FormData from 'form-data';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { ContextsManager } from '../../contexts';
import {
  CORRELATION_ID_HEADER,
  FETCH_USER_AGENT_HEADER,
  PUBLIC_API_URL,
  RUNTIME_EMITS_BROKER_TOPIC,
} from '../../../../../config';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import { logger } from '../../../../logger';

const AUTHENTICATE_PRISMEAI_URLS = ['/workspaces', '/pages'].map(
  (cur) => `${PUBLIC_API_URL}${cur}`
);

const base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
interface StreamChunk {
  event?: string;
  data: any[];
  id?: string;
  retry?: number;
}

export async function fetch(
  fetch: Prismeai.Fetch['fetch'],
  ctx: ContextsManager,
  broker: Broker
) {
  let {
    url,
    body,
    headers = {},
    method,
    query,
    multipart,
    emitErrors = true,
    stream,
  } = fetch;
  const lowercasedHeaders: Record<string, string> = Object.entries(
    headers || {}
  )
    .map(([key, value]) => [key.toLowerCase(), value])
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {}
    );

  if (!lowercasedHeaders['content-type'] && body) {
    headers = {
      ...headers,
      'content-type': 'application/json',
    };
  }

  if (
    AUTHENTICATE_PRISMEAI_URLS.some((cur) => url.startsWith(cur)) &&
    !('x-prismeai-token' in lowercasedHeaders) &&
    ctx?.session?.token
  ) {
    headers['x-prismeai-token'] = ctx?.session?.token;
  }

  const params: RequestInit = {
    headers: {
      [CORRELATION_ID_HEADER]: ctx.run.correlationId,
      ...headers,
      'User-Agent': FETCH_USER_AGENT_HEADER,
    },
    method: method,
  };

  // Process body
  if ((body || multipart) && (method || 'get')?.toLowerCase() !== 'get') {
    if (multipart) {
      delete (params.headers as any)['content-type'];
      params.body = new FormData();
      for (const { fieldname, value, ...opts } of multipart) {
        let convertedValue: any = value;
        const isBase64 = base64Regex.test(value as any);
        if (isBase64) {
          convertedValue = Buffer.from(value as any, 'base64');
        } else if (Array.isArray(value)) {
          convertedValue = Buffer.from(value);
        }
        (params.body as FormData).append(fieldname, convertedValue, opts);
      }
    } else if (
      lowercasedHeaders['content-type'] &&
      (lowercasedHeaders['content-type'] || '').includes(
        'application/x-www-form-urlencoded'
      )
    ) {
      params.body = typeof body === 'object' ? new URLSearchParams(body) : body;
    } else {
      params.body = typeof body === 'object' ? JSON.stringify(body) : body;
    }
  }
  const parsedURL = new URL(url);
  for (let [key, val] of Object.entries(query || {})) {
    if (Array.isArray(val)) {
      val.forEach((cur) => {
        parsedURL.searchParams.append(key, cur);
      });
    } else {
      parsedURL.searchParams.append(key, val);
    }
  }

  const result = await nodeFetch(parsedURL, params);
  let responseBody, error;
  if (!stream?.event) {
    responseBody = await getResponseBody(result);
    if (result.status >= 400 && result.status < 600 && emitErrors) {
      error = responseBody;
    }
  } else {
    let chunkIndex = 0;
    await streamResponse(result.body, async (chunk: StreamChunk) => {
      try {
        if (result.status >= 400 && result.status < 600) {
          error = chunk;
          responseBody = chunk;
        } else {
          await broker.send(
            stream?.event!,
            {
              index: chunkIndex,
              chunk,
              additionalPayload: stream?.payload,
            },
            {
              serviceTopic: RUNTIME_EMITS_BROKER_TOPIC,
            },
            { target: stream?.target, options: stream?.options }
          );
          chunkIndex++;
        }
      } catch (err) {
        logger.warn({ msg: `Could not stream fetch response chunk`, err });
      }
    });
  }

  if (error && emitErrors) {
    broker.send<Prismeai.FailedFetch['payload']>(EventType.FailedFetch, {
      request: fetch,
      response: {
        status: result.status,
        body: error,
        headers: result.headers,
      },
    });
  }
  return responseBody;
}

async function getResponseBody(response: Response) {
  const parseJSON = (response.headers.get('Content-Type') || '').includes(
    'application/json'
  );
  if (parseJSON) {
    const json = await response.json();
    return json;
  }
  return await response.text();
}

async function streamResponse(
  stream: NodeJS.ReadableStream,
  callback: (chunk: StreamChunk) => Promise<void>
) {
  for await (const buffer of stream) {
    const str = buffer.toString().trim();
    // No stream : entire json response is given at once
    if (str[0] === '[' || str[0] === '{') {
      try {
        return callback({
          data: [JSON.parse(str)],
        });
      } catch {}
    }
    const chunk: StreamChunk = str.split('\n').reduce<StreamChunk>(
      (chunk, line) => {
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
        }
        return chunk;
      },
      { data: [] }
    );
    await callback(chunk);
  }
}
