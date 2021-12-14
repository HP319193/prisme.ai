import type { NextApiRequest, NextApiResponse } from "next";

const DEV_USER = process.env.DEV_USER || "";

export const login = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email } = JSON.parse(req.body);
    const user = JSON.parse(DEV_USER);
    if (email !== user.email) {
      throw new Error("Wrong user");
    }
    res.setHeader("X-Prismeai-Session-Token", "dev-token");
    return res.send(user);
  } catch (e) {
    return res.status(400).send({
      error: "BadParameters",
      message: "Please set DEV_USER environement variable",
    });
  }
};

export default login;
