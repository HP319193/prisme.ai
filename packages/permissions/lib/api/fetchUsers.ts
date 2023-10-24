import fetch from 'node-fetch';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '#pZFT>2.g9x8p9D';
const GATEWAY_API_HOST =
  process.env.GATEWAY_API_HOST || 'http://localhost:3001/v2';
const API_KEY_HEADER = process.env.API_KEY_HEADER || 'x-prismeai-api-key';

export interface FindUserQuery {
  email?: string;
  ids?: string[];
}

export async function fetchUsers(
  query: FindUserQuery
): Promise<(Prismeai.User & { id: string })[]> {
  const ret = await fetch(`${GATEWAY_API_HOST}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [API_KEY_HEADER]: INTERNAL_API_KEY,
    },
    body: JSON.stringify(query),
  });
  const result = await ret.json();
  return result?.contacts || [];
}

export async function fetchMe(
  headers: any
): Promise<Prismeai.User & { id: string; sessionId: string }> {
  const ret = await fetch(`${GATEWAY_API_HOST}/me`, {
    method: 'GET',
    headers: headers,
  });
  const result = await ret.json();
  return result;
}
