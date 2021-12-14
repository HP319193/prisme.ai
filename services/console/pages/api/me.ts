// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

const DEV_USER = process.env.DEV_USER || "";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers && req.headers["x-prismeai-session-token"];
  try {
    if (token !== "dev-token") {
      throw new Error();
    }
    return res.send(JSON.parse(DEV_USER));
  } catch (e) {
    return res
      .status(401)
      .send({ error: "BadParameters", message: "Invalid token" });
  }
}
