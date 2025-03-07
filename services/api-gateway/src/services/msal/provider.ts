//@ts-nocheck
//Source: https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal
const msal = require('@azure/msal-node');
const fetch = require('node-fetch');

class AuthProvider {
  msalConfig;
  cryptoProvider;

  constructor(msalConfig) {
    this.msalConfig = msalConfig;
    this.cryptoProvider = new msal.CryptoProvider();
  }

  login(options = {}) {
    return async (req, res, next) => {
      /**
       * MSAL Node library allows you to pass your custom state as state parameter in the Request object.
       * The state parameter can also be used to encode information of the app's state before redirect.
       * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
       */
      const state = this.cryptoProvider.base64Encode(
        JSON.stringify({
          successRedirect: options.successRedirect || '/',
        })
      );

      const authCodeUrlRequestParams = {
        state: state,

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      };

      const authCodeRequestParams = {
        state: state,

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: options.scopes?.length ? options.scopes : ['profile', 'email'],
        redirectUri: options.redirectUri,
      };

      /**
       * If the current msal configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
       * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
       * metadata discovery calls, thereby improving performance of token acquisition process. For more, see:
       * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/performance.md
       */
      if (
        !this.msalConfig.auth.cloudDiscoveryMetadata ||
        !this.msalConfig.auth.authorityMetadata
      ) {
        const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
          this.getCloudDiscoveryMetadata(this.msalConfig.auth.authority),
          this.getAuthorityMetadata(this.msalConfig.auth.authority),
        ]);

        this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(
          cloudDiscoveryMetadata
        );
        this.msalConfig.auth.authorityMetadata =
          JSON.stringify(authorityMetadata);
      }

      const msalInstance = this.getMsalInstance(this.msalConfig);

      // trigger the first leg of auth code flow
      return this.redirectToAuthCodeUrl(
        authCodeUrlRequestParams,
        authCodeRequestParams,
        msalInstance
      )(req, res, next);
    };
  }

  handleRedirect(options = {}) {
    return async (req, res, next) => {
      if (!req.body || !req.body.state) {
        return next(new Error('Error: response not found'));
      }

      const authCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code,
        codeVerifier: req.session.pkceCodes.verifier,
      };

      try {
        const msalInstance = this.getMsalInstance(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenByCode(
          authCodeRequest,
          req.body
        );

        delete req.session.idToken;
        delete req.session.pkceCodes;
        delete req.session.authCodeUrlRequest;
        delete req.session.authCodeRequest;
        delete req.session.tokenCache;

        req.session.authData = {
          id: tokenResponse.uniqueId,
          firstName: tokenResponse.account.name,
          email:
            tokenResponse.account.idTokenClaims?.email ||
            tokenResponse.account.username,

          authority: tokenResponse.authority,
          scopes: tokenResponse.scopes,
          uniqueId: tokenResponse.uniqueId,
          account: {
            name: tokenResponse.account.name,
            environment: tokenResponse.account.environment,
            tenantId: tokenResponse.account.tenantId,
            username: tokenResponse.account.username,
          },
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Instantiates a new MSAL ConfidentialClientApplication object
   * @param msalConfig: MSAL Node Configuration object
   * @returns
   */
  getMsalInstance(msalConfig) {
    return new msal.ConfidentialClientApplication(msalConfig);
  }

  /**
   * Prepares the auth code request parameters and initiates the first leg of auth code flow
   * @param req: Express request object
   * @param res: Express response object
   * @param next: Express next function
   * @param authCodeUrlRequestParams: parameters for requesting an auth code url
   * @param authCodeRequestParams: parameters for requesting tokens using auth code
   */
  redirectToAuthCodeUrl(
    authCodeUrlRequestParams,
    authCodeRequestParams,
    msalInstance
  ) {
    return async (req, res, next) => {
      // Generate PKCE Codes before starting the authorization flow
      const { verifier, challenge } =
        await this.cryptoProvider.generatePkceCodes();

      // Set generated PKCE codes and method as session vars
      req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier: verifier,
        challenge: challenge,
      };

      /**
       * By manipulating the request objects below before each request, we can obtain
       * auth artifacts with desired claims. For more information, visit:
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
       **/
      req.session.authCodeUrlRequest = {
        ...authCodeUrlRequestParams,
        responseMode: msal.ResponseMode.FORM_POST, // recommended for confidential clients
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
      };

      req.session.authCodeRequest = {
        ...authCodeRequestParams,
        code: '',
      };

      try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
          req.session.authCodeUrlRequest
        );
        res.redirect(authCodeUrlResponse);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Retrieves cloud discovery metadata from the /discovery/instance endpoint
   * @returns
   */
  async getCloudDiscoveryMetadata(authority) {
    const endpoint =
      'https://login.microsoftonline.com/common/discovery/instance';

    try {
      const response = await fetch(
        endpoint +
          '?' +
          new URLSearchParams({
            'api-version': '1.1',
            authorization_endpoint: `${authority}/oauth2/v2.0/authorize`,
          })
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves oidc metadata from the openid endpoint
   * @returns
   */
  async getAuthorityMetadata(authority) {
    const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

    try {
      const response = await fetch(endpoint);
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }
}

export { AuthProvider };
