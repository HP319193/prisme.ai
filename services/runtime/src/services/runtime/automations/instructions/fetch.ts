import nodeFetch from 'node-fetch';
import { ContextsManager } from '../../contexts';
import { CORRELATION_ID_HEADER } from '../../../../../config';

export async function fetch(
  { url, body, headers, method }: Prismeai.Fetch['fetch'],
  ctx: ContextsManager
) {
  const result = await nodeFetch(url, {
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    headers: {
      [CORRELATION_ID_HEADER]: ctx.run.correlationId,
      ...headers,
    },
    method: method,
  });
  if (result.headers.get('Content-Type') === 'application/json') {
    return await result.json();
  }
  return await result.text();
}
