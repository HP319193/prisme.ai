import Agent from 'agentkeepalive';
import { URL, URLSearchParams } from 'url';
import FormData from 'form-data';
import nodeFetch, { RequestInit, Response, FetchError } from 'node-fetch';
import { DebouncedFunc } from 'lodash';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import { ContextsManager } from '../../contexts';
import {
  CORRELATION_ID_HEADER,
  FETCH_USER_AGENT_HEADER,
  API_URL,
  RUNTIME_EMITS_BROKER_TOPIC,
  API_KEY_HEADER,
} from '../../../../../config';
import { Broker, EventSource } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import { Logger, logger } from '../../../../logger';
import { getAccessToken } from '../../../../utils/jwks';
import { InvalidInstructionError } from '../../../../errors';

const keepaliveAgent = new Agent({
  keepAlive: true,
  freeSocketTimeout: 4000,
  timeout: 0,
});
const httpsKeepAliveAgent = new Agent.HttpsAgent({
  keepAlive: true,
  freeSocketTimeout: 4000,
  timeout: 0,
});

const AUTHENTICATE_PRISMEAI_URLS = ['/workspaces', '/pages', '/files'].map(
  (cur) => `${API_URL}${cur}`
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
  fetchParams: Prismeai.Fetch['fetch'],
  logger: Logger,
  ctx: ContextsManager,
  broker: Broker,
  opts?: {
    maxRetries?: number;
  }
): Promise<any> {
  if (!fetchParams.url) {
    throw new InvalidInstructionError(`Invalid fetch instruction : empty url`);
  }
  const maxRetries =
    typeof opts?.maxRetries !== 'undefined' ? opts.maxRetries : 2;
  let {
    url,
    body,
    headers = {},
    method,
    query,
    multipart,
    emitErrors = true,
    stream,
    prismeaiApiKey,
  } = fetchParams;
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

  const isPrismeaiRequest = AUTHENTICATE_PRISMEAI_URLS.some((cur) =>
    url.startsWith(cur)
  );

  if (
    isPrismeaiRequest &&
    !lowercasedHeaders['x-prismeai-token'] &&
    !lowercasedHeaders['authorization'] &&
    (ctx?.session?.origin?.userId || ctx?.session?.userId) &&
    (ctx?.session?.origin?.sessionId || ctx?.session?.sessionId)
  ) {
    const { jwt } = await getAccessToken({
      userId: ctx?.session?.origin?.userId || ctx?.session?.userId,
      prismeaiSessionId:
        ctx?.session?.origin?.sessionId || ctx?.session?.sessionId,
      expiresIn: 10,
    });
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  if (isPrismeaiRequest && prismeaiApiKey?.name) {
    headers[API_KEY_HEADER] = await ctx.getWorkspaceApiKey(
      prismeaiApiKey?.name
    );
  }

  const params: RequestInit = {
    headers: {
      [CORRELATION_ID_HEADER]: ctx.run.correlationId,
      ...headers,
      'User-Agent': FETCH_USER_AGENT_HEADER,
      'x-prismeai-workspace-id': ctx.workspaceId,
    },
    method: method,
    agent: function (_parsedURL) {
      if (_parsedURL.protocol == 'http:') {
        return keepaliveAgent;
      } else {
        return httpsKeepAliveAgent;
      }
    },
  };

  // Process body
  if ((body || multipart) && (method || 'get')?.toLowerCase() !== 'get') {
    if (multipart) {
      delete (params.headers as any)['content-type'];
      params.body = new FormData();
      for (const { fieldname, value, ...opts } of multipart) {
        let convertedValue: any = value;
        // Only test the beginning as Regexp.test is under the hood a recursive function that crashes (exceeded call stack) on big file base64
        const isBase64 =
          typeof value === 'string' &&
          value.toLowerCase() != 'false' &&
          value.toLowerCase() != 'true' &&
          base64Regex.test(value.slice(0, 1024)); // Must slice a multiplicator of 4 to fit with b64 regex !
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

  let result: Response;
  try {
    result = await nodeFetch(parsedURL, params);
  } catch (e) {
    const err = <FetchError>e;
    if (err?.code == 'ECONNRESET' && maxRetries > 0) {
      logger.info({
        msg: `Retrying request towards ${url} as we received ${err?.code} error ...`,
      });
      return await fetch(fetchParams, logger, ctx, broker, {
        ...opts,
        maxRetries: maxRetries - 1,
      });
    }
    throw e;
  }
  let responseBody, error;
  if (!stream?.event) {
    responseBody = await getResponseBody(result);
    if (result.status >= 400 && result.status < 600 && emitErrors) {
      error = responseBody;
    }
  } else {
    let chunkIndex = 0;
    let concatenated: string | any[] | undefined;
    const send = (
      eventType: string,
      payload: any,
      partialSource: Partial<EventSource> | undefined,
      additionalFields: any
    ) => broker.send(eventType, payload, partialSource, additionalFields);
    const emitEvent = stream?.concatenate?.throttle
      ? throttle(send, stream?.concatenate?.throttle)
      : send;

    await streamResponse(
      result.body,
      async (chunk: StreamChunk) => {
        try {
          if (result.status >= 400 && result.status < 600) {
            error = chunk;
            responseBody = chunk;
          } else {
            if (stream?.concatenate?.path) {
              chunk.data.forEach((data) => {
                const toConcatenate = get(data, stream?.concatenate?.path!);
                if (toConcatenate) {
                  if (!concatenated) {
                    concatenated = toConcatenate;
                  } else {
                    concatenated = concatenated.concat(toConcatenate);
                  }
                }
              });
            }
            await emitEvent(
              stream?.event!,
              {
                index: chunkIndex,
                chunk,
                concatenated: concatenated
                  ? { value: concatenated }
                  : undefined,
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
      },
      broker
    );

    if (stream?.concatenate?.throttle) {
      // If the events were throttled we flush at the end in order to emit the last one right away.
      (emitEvent as DebouncedFunc<any>).flush();
    }
  }

  if (error && emitErrors) {
    broker.send<Prismeai.FailedFetch['payload']>(EventType.FailedFetch, {
      request: fetchParams,
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
  callback: (chunk: StreamChunk) => Promise<void>,
  broker: Broker
) {
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
    const chunk: StreamChunk = str.split('\n\n').reduce<StreamChunk>(
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
        } else {
          logger.warn({ msg: 'Invalid SSE chunk line', line });
        }
        return chunk;
      },
      { data: [] }
    );
    await callback(chunk);
  }
}
