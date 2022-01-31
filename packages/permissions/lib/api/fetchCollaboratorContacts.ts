import fetch from "node-fetch";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "#pZFT>2.g9x8p9D";
const GATEWAY_API_URL = process.env.GATEWAY_API_URL || "http://localhost:3001";
const API_KEY_HEADER = process.env.API_KEY_HEADER || "x-prismeai-api-key";

export interface FindUserQuery {
  email?: string;
  ids?: string[];
}

export async function fetchCollaboratorContacts(
  query: FindUserQuery
): Promise<Prismeai.User[]> {
  const ret = await fetch(`${GATEWAY_API_URL}/v2/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [API_KEY_HEADER]: INTERNAL_API_KEY,
    },
    body: JSON.stringify(query),
  });
  const result = await ret.json();
  return result?.contacts || [];
}
