import nodeFetch, { RequestInit } from 'node-fetch';
import { ContextsManager } from '../../contexts';
import { CORRELATION_ID_HEADER } from '../../../../../config';

export async function fetch(
  { url, body, headers, method }: Prismeai.Fetch['fetch'],
  ctx: ContextsManager
) {
  const params: RequestInit = {
    headers: {
      [CORRELATION_ID_HEADER]: ctx.run.correlationId,
      ...headers,
    },
    method: method,
  };
  if (body && (method || 'get')?.toLowerCase() !== 'get') {
    params.body = typeof body === 'object' ? JSON.stringify(body) : body;
  }
  const result = await nodeFetch(url, params);
  if ((result.headers.get('Content-Type') || '').includes('application/json')) {
    return await result.json();
  }
  return await result.text();
}
