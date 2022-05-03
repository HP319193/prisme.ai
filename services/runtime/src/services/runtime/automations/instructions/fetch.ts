import nodeFetch, { RequestInit } from 'node-fetch';
import { ContextsManager } from '../../contexts';
import { CORRELATION_ID_HEADER } from '../../../../../config';
import { URLSearchParams } from 'url';

export async function fetch(
  { url, body, headers, method }: Prismeai.Fetch['fetch'],
  ctx: ContextsManager
) {
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

  const params: RequestInit = {
    headers: {
      [CORRELATION_ID_HEADER]: ctx.run.correlationId,
      ...headers,
    },
    method: method,
  };
  if (body && (method || 'get')?.toLowerCase() !== 'get') {
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
  const result = await nodeFetch(url, params);
  if ((result.headers.get('Content-Type') || '').includes('application/json')) {
    return await result.json();
  }
  return await result.text();
}
