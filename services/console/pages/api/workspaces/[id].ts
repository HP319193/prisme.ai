import type { NextApiRequest, NextApiResponse } from "next";

import { workspaces } from "./index";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pos = workspaces.findIndex(({ id }) => id === req.query.id);
  if (pos > -1) {
    if (req.method === "PATCH") {
      workspaces[pos] = JSON.parse(req.body);
      return res.send(workspaces[pos]);
    }
    return res.send(workspaces[pos]);
  }
  return res.status(404).send({
    error: "ObjectNotFound",
    message: "Workspace not found",
  });
}
