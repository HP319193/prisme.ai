import { URL, URLSearchParams } from 'url';
import FormData from 'form-data';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { ContextsManager } from '../../contexts';
import { CORRELATION_ID_HEADER, PUBLIC_API_URL } from '../../../../../config';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';

const AUTHENTICATE_PRISMEAI_URLS = ['/workspaces'].map(
  (cur) => `${PUBLIC_API_URL}${cur}`
);

const base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export async function fetch(
  fetch: Prismeai.Fetch['fetch'],
  ctx: ContextsManager,
  broker: Broker
) {
  let { url, body, headers = {}, method, query, multipart } = fetch;
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
    },
    method: method,
  };

  if (multipart) {
    delete (params.headers as any)['content-type'];
    params.body = new FormData();
    for (const { fieldname, value, ...opts } of multipart) {
      const isBase64 = base64Regex.test(value as any);
      (params.body as FormData).append(
        fieldname,
        isBase64 ? Buffer.from(value as any, 'base64') : value,
        opts
      );
    }
  } else if (body && (method || 'get')?.toLowerCase() !== 'get') {
    if (
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
    parsedURL.searchParams.append(key, val);
  }
  const result = await nodeFetch(parsedURL, params);
  const responseBody = await getResponseBody(result);
  if (result.status >= 400 && result.status < 600) {
    broker.send<Prismeai.FailedFetch['payload']>(EventType.FailedFetch, {
      request: fetch,
      response: {
        status: result.status,
        body: responseBody,
        headers: result.headers,
      },
    });
  }
  return responseBody;
}

async function getResponseBody(response: Response) {
  if (
    (response.headers.get('Content-Type') || '').includes('application/json')
  ) {
    const json = await response.json();
    return json;
  }
  return await response.text();
}
