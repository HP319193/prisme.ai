import { Configuration } from 'oidc-provider';

export default {
  // PROVIDER_URL and LOGIN_FORM must share a same parent domain for cookies to be properly transmitted between login form & OIDC provider
  PROVIDER_URL:
    process.env.OIDC_PROVIDER_URL ||
    (process.env.API_URL || '').replace('/v2', '') ||
    'http://studio.local.prisme.ai:3001',
  LOGIN_FORM: `${
    process.env.CONSOLE_URL || 'http://studio.local.prisme.ai:3000'
  }/signin`,
  CONFIGURATION: <Configuration>{
    // Claims per scope
    claims: {
      profile: ['firstName', 'lastName', 'photo', 'language'],
      email: ['email'],
      settings: ['mfa', 'meta', 'authData'],
    },

    features: {
      // Enable client credentials grant type for machine to machine communication
      clientCredentials: {
        enabled: true,
      },
      introspection: {
        enabled: true,
      },
      userinfo: {
        enabled: true,
      },
      devInteractions: {
        enabled: false, // Set to false when finisheds
      },
    },
    clients: [
      {
        client_id: 'app',
        client_secret: 'a_secret',
        grant_types: ['client_credentials'],
        redirect_uris: [],
        response_types: [],
      },
      {
        client_id: 'local-client-id',
        client_secret: 'a_different_secret',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        redirect_uris: [
          'http://studio.local.prisme.ai:3000/signin',
          'http://*.pages.local.prisme.ai:3100/signin',
        ],
        token_endpoint_auth_method: 'none',
      },
    ],

    jwks: {
      keys: [
        {
          kty: 'RSA',
          alg: 'RS256',
          use: 'sig',
          d: 'EF2Kky61jzvMYQ_B6ImXzCsQ8uQzbFJrGnB2azlpr_CFStjjUVKP4EKrSCVEasD6SGNJV2QSiNJr7j05nvuGmHMKa__rbU8fqP4qbDahUgCgWOq-zS5tGK6Ifk4II_cZ_V1F-TnrvmcOKMWBiSV-p8i72KpXXucbHGNRwASVs7--M55wp_m1UsybI2jSQ4IgyvGzTnvMmQ_GsX-XoD8u0zGU_4eN3DGc8l6hdxxuSymH0fEeL1Aj0LoCj6teRGF37a2sBQdU6mkNNAuyyirkoDqGZCGJToQLqX4F1FafnzjeIgfdneRa-vuaV380Hhr2rorWnQyBqOO27M5O_VAkJbfRaWJVrXTJ69ZgkU4GPdeYdklVL0HkU6laziTNqNMeAjnt4m51sWokVyJpvdWcb_vJ4NSCsRo7kHOz7g-UvWTXa8UW0DTDliq_TJ3rN4Gv0vn9tBlFfaeuLPpK4VNmRRDRXY_fcuzlnQwYExL9a4V_vCyGmabdb7PrUFPBcjR5',
          dp: 'SX52TkZEc_eLIk5gYrKjAC643LJIw1RxMBWWewRSGLn_rbrH1he3hy7AGDUV6Uon7zkNh9R5GBVuxmlluBRAGbrhIXAAf8sWeyma3F6FIAt-MH_VkfW5K2p88PLOyVGljlv8-Z3wzdKYOlDP4yFU18LqGMqaRSDLDGhILkuZhjLYA40sfYJeJTi_HVP5UyWL4ohayqUWCT2W3DgeDDThYHmufOaqlrSLhUst6uez_cDz0BXAYIZvUuPVL_n1-_px',
          dq: 'K1KYU77I6yyPA2u32rc0exp_TCG59hhpWxrmXN8yTXWyq_xYBhCJA_nHdY8UV25Hmd7q0iX2i8y2cCAFNWA5UWiSiNg9-fKRLI2nz53IM4dGfssOLwUk66wzX8r_u3XiLZsO7XNNtQZdcZmF0YuNTtzEdiNDhaOyHiwwHgShL36WNmUn00mZR__G5Qk60VvI8vsbvJU9xRnWuEVS1wRgyD7v6Nl9nIxb8N7oibCdTJLmgnRXPWvArsW0cJ-NURfr',
          e: 'AQAB',
          n: '2QwX-NBMkQYedGpbPvHL7Ca0isvfmLC7lSc8XSOCLmCUIf6Bk_pdCNx2kxsmT81IoA8CfvJLHQj5vWKoVDFMLfwo4IujvsC3m2IrEg6jERE-YHfC3W5jKZtmzQYpfx5vC2_XTmcyPigtyaNVsftGfycES3B_tvphNsFmQcJjVGOsJQXXqh_TDv6FMcH4m9pngyw6wfe3GgAKA0dRTSfD0h7wLdNCeuid53lLpkQypTNdZ6_PiCMu2gr_cH5M0MPZtBb2TW12_2zOabExK1lI5-HvdPtbMT4Qzs2nd2NkjcWmlbKRZzq6IzyWt7W2EnfZDsi61PHECtTb-EQN2icl8Wnsp-0Bw66yviAOj0gn3X5hRLx-TknT_PnWMou17l5GoAojKDezcTW0iLlrfs2ixFlY28u7WklUN8uYhHvwgON6fsdefG-3bPpiRLBPZ_tgXa4doALsCwfXu2oz0vYktk31A-UYv92uJsKSUbK0_8ODTN0rslCqCYN_1a_aVt2P',
          p: '--L5BX8juLlGJk8hdPgEUmJjD7SsZuMrdq3cSibkkbaWUE5CQQ7vhLPr2dWCS1jUnY9WyoCx9QCZvhTHjORX50ykkOyBso9VJjWvYPjsrPpF7_Y6V0dKlblDmbbmRT9BW-MgjbwTivu3c2OpMXh2XLF-FOTq3t3Brs7SRnhTkD6GBDFf3X95J0PF7NELa9z2-kzPSDYz3k-9FepXnRPBM_ViDzlRw4eKUdylVuhzGbC2TRSmab9BRP0wipQKd-f5',
          q: '3Jd5CRJpQV3xUi3FiHHAwcjfsRkfXMrxfaXt0PjX2xWzxscYiDcyCF6VhHTAGsiq5SOtCp3l5mg6A9PzdR53AzM2-706D82fMwiUZvsLOVTepXkgriP_xw7rDlkOeAvjB80sL2G9scFliTzzRZ8I8E79A8DxZihfB75AIN9ijklEihnwxfhp2EgO5MYEyQRcqU1TT8wD8ekLMzd-kJUWyTz3BogiVJH__BQoB6kaDyjvQoxBgwh0hi72t9H5XqPH',
          qi: 'cwK0jhzwbu8BaTmTQhwfGiqwNN3v9F4nUQ4dtnBYRI6zlki4cLb2Mf9-VhyEsUYhhdTm8R7RwO9m5Xct3gEfozdk35wuvkVwkZgL3Uho5asao0xi4aENeUk5DCkU-paO3yLSDhIs9YYuYIDjUX6QuMCPjomypuE3SRm-Dg1PGOxYvX3w_P-0kd5iBFrm4jwGTZViFOr8tl_dXgDRDWDgofOYOYcmUv2_0zt1aO3j5dhEpwdkyuDMLfVZNpJQyopJ',
          kid: 'f262a3214213d194c92991d6735b153b',
        },
      ],
    },

    // pkce: {
    //   // required: true

    // },

    // acrValues: ['session', 'urn:mace:incommon:iap:bronze'],
    cookies: {
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
      // Keygrip Signing keys used for cookie signing to prevent tampering.
      // Should be regularly rotated by adding new keys at the end & removing older ones
      keys: [],
      //   long: { signed: true, maxAge: (1 * 24 * 60 * 60) * 1000 }, // 1 day in ms
      short: {
        // signed: true
        httpOnly: true,
        overwrite: true,
        sameSite: 'lax',
        path: '/',
        // domain: 'local.prisme.ai',
      },
    },

    // ttl: {
    //   AccessToken: 1 * 60 * 60, // 1 hour in seconds
    //   AuthorizationCode: 10 * 60, // 10 minutes in seconds
    //   ClientCredentials: 10 * 60, // 10 minutes in seconds
    //   IdToken: 1 * 60 * 60, // 1 hour in seconds
    //   RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds

    //   // HEROKU EXAMPLE ONLY, do not use the following expiration unless you want to drop dynamic
    //   //   registrations 24 hours after registration
    //   RegistrationAccessToken: 1 * 24 * 60 * 60, // 1 day in seconds
    // },
  },
};
