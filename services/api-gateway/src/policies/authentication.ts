import express from 'express';
import { syscfg } from '../config';
import { AuthenticationError } from '../types/errors';
import { enforceMFA as mfaMiddleware } from '../middlewares/authentication/isAuthenticated';
import { generateToken } from '../utils/tokens';
import { logger } from '../logger';

export interface Params {
  injectUserIdHeader?: boolean;
  optional?: boolean;
  allowApiKeyOnly?: boolean;
  enforceMFA?: boolean;
  csrf?: {
    includeToken?: boolean;
    validateToken?: boolean;
  };
}

export const validatorSchema = {
  injectUserIdHeader: 'boolean',
  optional: 'boolean',
  allowApiKeyOnly: 'boolean',
  enforceMFA: 'boolean',
  csrf: {},
};

export function init(params: Params) {
  let {
    injectUserIdHeader = true,
    optional = false,
    allowApiKeyOnly = false,
    enforceMFA = true,
    csrf,
  } = params;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    /*
     * Disable CSRF protection as it is unrelevant for any non browser client, including :
     * * unauthenticated requests (no one's session is at risk of being compromised by a CSRF exploit)
     * * Workspace fetches (non browser clients)
     * * 'Authorization: Bearer' authenticated requests, as this method does not suffer from CSRF
     */
    let validateCsrfToken = csrf?.validateToken;
    if (
      validateCsrfToken &&
      (!req.user ||
        req.context?.sourceWorkspaceId ||
        req.locals?.authScheme === 'bearer')
    ) {
      validateCsrfToken = false;
    }

    if (!req.user && allowApiKeyOnly && req.headers[syscfg.API_KEY_HEADER]) {
      optional = true;
      // TODO should check api key validity
    }
    if (req.user && injectUserIdHeader) {
      req.headers[syscfg.USER_ID_HEADER] = req.user?.id;
    }
    if (!req.user && !optional) {
      throw new AuthenticationError(req.authError || 'Unauthenticated');
    }

    if (csrf?.includeToken) {
      initCSRFToken(req, res);
    }

    if (
      validateCsrfToken &&
      req.method !== 'GET' &&
      (!req.session.csrfToken ||
        !req.header(syscfg.CSRF_TOKEN_HEADER) ||
        req.session.csrfToken !== req.header(syscfg.CSRF_TOKEN_HEADER))
    ) {
      const reason = req.header(syscfg.CSRF_TOKEN_HEADER)
        ? 'Invalid CSRF token found.'
        : 'Missing CSRF token.';
      (req.logger || logger).error({
        msg: `Potential CSRF exploit detected (${reason})`,
      });
      throw new AuthenticationError(reason);
    }

    if (enforceMFA && !optional) {
      return mfaMiddleware(req, res, next);
    }

    next();
  };
}

export function initCSRFToken(req: express.Request, res: express.Response) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  if (res) {
    res.setHeader(syscfg.CSRF_TOKEN_HEADER, req.session.csrfToken);
  }
  return req.session.csrfToken;
}
