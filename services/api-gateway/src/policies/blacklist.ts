import { Request, Response } from "express";
import { GatewayConfig } from "../config";

export interface Params {
  paths: string[];
}

export const validatorSchema = {
  paths: "required|array:string",
};

export async function init(params: Params, gtwcfg: GatewayConfig) {
  const isBlacklistedRequest = (req: Request) => {
    return params.paths.some((cur) => new RegExp(cur).test(req.url));
  };
  return (req: Request, resp: Response, next: any) => {
    if (isBlacklistedRequest(req)) {
      resp.status(500).send("Blacklisted");
    } else {
      next();
    }
  };
}
