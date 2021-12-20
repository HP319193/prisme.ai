import express from "express";
import superagent from "superagent";
import { GatewayConfig } from "../config";
import { errors } from "../types";
import { syscfg } from "../config";

export interface Params {
  injectUserIdHeader?: boolean;
}

export const validatorSchema = {
  injectUserIdHeader: "boolean",
};

export const getAuthorizationToken = (request: any): any => {
  const authorization =
    request.headers.authorization || request.headers.Authorization;

  let clientToken;
  if (authorization && authorization.startsWith("Bearer ")) {
    clientToken = authorization.substring(7, authorization.length);
  }
  if (!clientToken) {
    throw new errors.AuthenticationError();
  }
  return clientToken;
};

export const getAuthenticatedUser = async (request: any): Promise<any> => {
  const sessionToken = getAuthorizationToken(request);

  try {
    const { body: userData } = await superagent
      .get(`${syscfg.PRISME_AUTH_PARSE_URL}/users/me`)
      .set("X-Parse-Application-Id", syscfg.PRISME_AUTH_PARSE_APP_ID)
      .set("X-Parse-Session-Token", sessionToken);
    return userData;
  } catch (error) {
    if (
      (<any>error).response &&
      (<any>error).response.body &&
      (<any>error).response.body.error == "Invalid session token"
    ) {
      throw new errors.ForbiddenError();
    }
    throw error;
  }
};

export async function init(params: Params, gtwcfg: GatewayConfig) {
  const { injectUserIdHeader = true } = params;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    req.context.user = await getAuthenticatedUser(req);
    if (injectUserIdHeader) {
      req.headers[syscfg.USER_ID_HEADER] = req.context.user?.objectId;
    }
    next();
  };
}
