// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Workspace } from "../../../api/types";

const idCharacters: number[] = [];
for (let i = 97; i < 123; i++) {
  // letters
  idCharacters.push(i);
}
for (let i = 65; i < 91; i++) {
  // LETTERS
  idCharacters.push(i);
}
for (let i = 48; i < 57; i++) {
  // numbers
  idCharacters.push(i);
}

const generateId = () => {
  return Array.from(new Array(10), (v) => v)
    .map((v) =>
      String.fromCharCode(
        idCharacters[parseInt(`${Math.random() * idCharacters.length}`)]
      )
    )
    .join("");
};

export const workspaces: Workspace[] = [
  {
    name: "First workspace",
    automations: {
      First: {
        triggers: {},
        workflows: {},
      },
    },
    createdAt: new Date().toUTCString(),
    updatedAt: new Date().toUTCString(),
    id: "52jFS4C48Z",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const newWorkspace = JSON.parse(req.body);
      newWorkspace.id = generateId();
      newWorkspace.createdAt = new Date().toUTCString();
      newWorkspace.updatedAt = new Date().toUTCString();
      workspaces.push(newWorkspace);
      return res.send(newWorkspace);
    } catch (e) {
      return res.status(500).send({ error: "Unknown error", message: "oups" });
    }
  }
  res.send(workspaces);
}
