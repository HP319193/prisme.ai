import { Broker } from '@prisme.ai/broker';
import { URL } from 'url';
import { EventType, broker } from '../eda';
import { getAllRedirectUris } from '../services/oidc/client';
import { oidcCfg } from '../config';
import { logger } from '../logger';

const { PAGES_HOST, STUDIO_URL } = oidcCfg;
/**
 * Service which handles retrieving custom domain for cors purpose.
 */
export class CustomDomains {
  customDomains: Set<string>;

  constructor() {
    this.customDomains = new Set();
  }

  /**
   * Asynchronously retrieves all custom domain based on the redirectUris of the different registered OAuthClients.
   * Filters out pages domains based on the PAGES_HOST env variable.
   * @returns this class so you can chain call
   */
  async init() {
    const pagesSubdomainRegex = new RegExp(`[^.]+${PAGES_HOST}`);

    const limitedRedirectUris = await getAllRedirectUris({
      redirectUris: {
        $elemMatch: { $not: { $regex: pagesSubdomainRegex } },
      },
    });
    this.customDomains = new Set(
      limitedRedirectUris
        .filter((redirectUri) => !pagesSubdomainRegex.test(redirectUri))
        .map((customRedirectUris) => {
          try {
            return new URL(customRedirectUris).hostname;
          } catch {
            logger.warn(
              `Failed parsing customDomain for the following URI : ${customRedirectUris}. This domain will not be allowed by CORS policy.`
            );
            return '';
          }
        })
    );

    this.startWorkspacesCustomDomainsSync(broker);
    return this;
  }

  /**
   * Verify if a domain is allowed
   * @param origin
   * @returns
   */
  public isAllowed(origin: string): boolean {
    let domain = '';
    try {
      domain = new URL(origin).hostname;
    } catch {
      // Can occur when calls are made without origin
    }
    return (
      !domain ||
      allowedOrigins.includes(domain) ||
      this.customDomains.has(domain) ||
      pagesSubdomainRegex.test(domain)
    );
  }

  /**
   * After initialization, we synchronize the list of domains with events.
   * @param broker
   */
  private startWorkspacesCustomDomainsSync(broker: Broker) {
    logger.info('Succesfully started custom domains synchronization.');
    broker.on(
      [EventType.UpdatedWorkspace],
      async (event) => {
        try {
          if (event.type === EventType.UpdatedWorkspace) {
            const { payload } = event as Prismeai.UpdatedWorkspace;
            if (payload.workspace.customDomains) {
              payload.workspace.customDomains.forEach((domain) =>
                this.customDomains.add(domain)
              );
            }
          }
        } catch (err) {
          logger.warn({
            msg: 'Failed ton synchronize Custom Domains list for CORS.',
            err,
          });
        }
        return true;
      },
      { GroupPartitions: false }
    );
  }
}

export const allowedOrigins = [STUDIO_URL].map((url) => {
  try {
    return new URL(url).hostname;
  } catch {
    logger.erro('You provided an invalid URL.');
    return url;
  }
});

export const pagesSubdomainRegex = new RegExp(
  `[^.]+${PAGES_HOST.replace(/:\d+$/, '')}`
);
