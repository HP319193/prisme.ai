import express, { NextFunction, Request, Response } from "express";
import services from "../services";
import passport from "passport";
import { isAuthenticated } from "../middlewares/authentication";
import { AuthenticationError } from "../types/errors";
import { EventType } from "../eda";

const loginHandler = (strategy: string) =>
  async function (
    req: Request<any, any, PrismeaiAPI.CredentialsAuth.RequestBody>,
    res: Response<PrismeaiAPI.CredentialsAuth.Responses.$200>,
    next: NextFunction
  ) {
    passport.authenticate(
      strategy,
      { session: true },
      async (err, user, info) => {
        if (err || !user) {
          next(new AuthenticationError(info.message));
          await req.broker.send(EventType.FailedLogin, {
            email: req.body.email,
            ip: req.context?.http?.ip,
          });
          return;
        }

        req.logIn(user, async (err) => {
          if (err) {
            req.logger?.error(err);
            return next(
              new AuthenticationError("Unknown authentication error")
            );
          }
          res.send(user);
          await req.broker.send(EventType.SucceededLogin, {
            email: user.email || user.firstName,
            ip: req.context?.http?.ip,
            id: user.id,
          });
        });
      }
    )(req, res, next);
  };

async function signupHandler(
  req: Request<any, any, PrismeaiAPI.Signup.RequestBody>,
  res: Response<PrismeaiAPI.Signup.Responses.$200>,
  next: NextFunction
) {
  const { context, body } = req;
  const identity = services.identity(context);
  await identity.signup(body);
  loginHandler("local")(req, res, next);
}

async function meHandler(
  req: Request,
  res: Response<PrismeaiAPI.GetMyProfile.Responses.$200>
) {
  res.send(req.user);
}

async function logoutHandler(req: Request, res: Response) {
  req.logout();
  res.status(200).send();
}

const app = express.Router();

app.post(`/login`, loginHandler("local"));
app.post(`/login/anonymous`, loginHandler("anonymous"));
app.post(`/signup`, signupHandler);
app.get(`/me`, isAuthenticated, meHandler);
app.post(`/logout`, logoutHandler);

export default app;
