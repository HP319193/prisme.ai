import fs from 'fs';
import jose from 'node-jose';
import { oidcCfg, syscfg } from '../../config';
import { v4 as uuid } from 'uuid';
import { ConfigurationError, PrismeError } from '../../types/errors';
import { logger } from '../../logger';
import { buildStorage } from '../../storage';
import { storage } from '../../config';
import {
  JWKS_ALG,
  JWKS_KTY,
  JWKS_ROTATION_DAYS,
  JWKS_SIZE,
} from '../../config/oidc';
import path from 'path';
import { EventType } from '../../eda';
import { JWK, PrismeaiJWK } from './types';
import { Broker } from '@prisme.ai/broker';
import EventEmitter from 'events';

/**
 * Prismeai JWKs management
 */

const JWKS = buildStorage<PrismeaiJWK>('JWKS', {
  ...storage.JWKS,
  indexes: ['kid'],
  uniqueIndexes: ['previousKeyId'],
});

const JWKS_FILEPATH =
  process.env.JWKS_FILEPATH || path.resolve('../../jwks.json');

export class JWKStore extends EventEmitter {
  private keyStore: jose.JWK.KeyStore | undefined;
  private broker: Broker;

  public jwks: PrismeaiJWK[];

  constructor(broker: Broker) {
    super();
    this.jwks = [];
    this.broker = broker;
  }

  get store() {
    return {
      keys: this.jwks.map((cur) => cur.jwk),
    };
  }

  async init(rotate = true) {
    if (rotate) {
      this.broker.on(
        EventType.UpdatedJWKS,
        async (event) => {
          const fromLocal =
            event?.source?.host?.replica &&
            event?.source?.host?.replica === this.broker.consumer.name;

          // Refresh other nodes from cache
          if (!fromLocal) {
            logger.info({
              msg: `Reloading JWKS store`,
            });
            await this.init(false);
          }

          this.emit('jwks.updated', {
            fromLocal,
          });

          return true;
        },
        {
          GroupPartitions: false, // Every instance must be kept in sync with jwks store
        }
      );
    }

    this.jwks = (await JWKS.find({}))
      // First JWK must be the youngest one as we will sign only with this one
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (this.jwks.length) {
      try {
        if (rotate) {
          await this.rotate();
        }
      } catch (err) {
        logger.error({
          msg: `An error occured while rotating JWKS`,
          err,
        });
        throw err;
      }
    } else {
      // Legacy migration from file storage to collection
      await this.migrateJWKSFromFile(JWKS_FILEPATH);
    }

    this.keyStore = await jose.JWK.asKeyStore({
      keys: this.jwks.map((cur) => cur.jwk),
    });
  }

  private async rotate() {
    let storeUpdateEvent: Prismeai.UpdatedJWKS['payload'] = {
      created: [],
      deleted: [],
    };
    // Remove expired jwks
    this.jwks = this.jwks
      .filter((cur) => {
        if (Date.now() > new Date(cur.expiresAt).getTime()) {
          storeUpdateEvent.deleted.push(cur.kid);
          return false;
        }
        return true;
      })
      // List must begin with youngest JWK as we will sign only with this one
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (storeUpdateEvent.deleted.length) {
      logger.info({
        msg: `Remove ${storeUpdateEvent.deleted.length} expired JWKS`,
        kids: storeUpdateEvent.deleted,
      });
      Promise.all(storeUpdateEvent.deleted.map((kid) => JWKS.delete({ kid })));
    }

    // Rotate signing jwk
    const signingJWK = this.jwks[0];
    if (!signingJWK || Date.now() > new Date(signingJWK.rotatesAt).getTime()) {
      const newJWK = await this.addJWK(await generateJWK(), signingJWK?.kid);
      if (newJWK) {
        storeUpdateEvent.created.push(newJWK.kid);
        logger.info({
          msg: `Rotated last active JWK ${signingJWK?.kid || ''} ...`,
        });
      }
    }

    if (storeUpdateEvent.created.length || storeUpdateEvent.deleted.length) {
      this.broker
        .send<Prismeai.UpdatedJWKS['payload']>(
          EventType.UpdatedJWKS,
          storeUpdateEvent,
          {},
          {},
          {
            disableValidation: true,
          }
        )
        .catch(logger.error);
    }
  }

  private async addJWK(jwk: JWK, previousKeyId?: string) {
    const now = new Date();
    const rotationMs = JWKS_ROTATION_DAYS * 24 * 3600 * 1000;
    const expirationMs = rotationMs + oidcCfg.ACCESS_TOKENS_MAX_AGE * 1000;
    const prismeaiJWK: PrismeaiJWK = {
      kid: jwk.kid,
      jwk,
      createdAt: now.toISOString(),
      rotatesAt: new Date(now.getTime() + rotationMs).toISOString(),
      expiresAt: new Date(now.getTime() + expirationMs).toISOString(),
      previousKeyId,
    };
    try {
      // Leverage previousKeyId unique index to avoid rotating the same key multiple times from different nodes
      await JWKS.save(prismeaiJWK, {
        upsertQuery: {
          kid: prismeaiJWK.kid,
        },
      });

      this.jwks = [prismeaiJWK, ...this.jwks];
    } catch (err) {
      if (((<any>err)?.message || '').includes('duplicate key error')) {
        return false;
      }
      throw err;
    }

    return prismeaiJWK;
  }

  private async migrateJWKSFromFile(filepath: string = JWKS_FILEPATH) {
    let json;
    try {
      json = fs.readFileSync(filepath);
    } catch (err) {
      throw new ConfigurationError(`Can't find JWKS file at '${filepath}'`, {
        err,
      });
    }
    const jwks = JSON.parse(json.toString()) as { keys: JWK[] };
    let idx = 0;
    const reversedKeys = jwks.keys.reverse();
    for (let jwk of reversedKeys) {
      await this.addJWK(jwk, idx === 0 ? undefined : reversedKeys[idx - 1].kid);
      idx++;
    }

    logger.info({
      msg: `Initialized JWKS collection from ${filepath}`,
    });
  }

  async sign(payload: any) {
    if (!this.keyStore) {
      throw new PrismeError(
        'Cannot sign with uninitialized JWK keystore',
        {},
        500
      );
    }
    const [key] = this.keyStore.all({ use: 'sig' });
    const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } };

    const token = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(payload))
      .final();
    return token;
  }

  public async getAccessToken(userId: string, expiresAfter?: number) {
    if (!expiresAfter) {
      expiresAfter = oidcCfg.ACCESS_TOKENS_MAX_AGE;
    }
    const expires = new Date(Date.now() + expiresAfter * 1000);
    // Mimic OIDC emitted JWT tokens so we can validate / handle these anonymous session exactly like for OIDC tokens
    const token = {
      exp: Math.floor(expires.getTime() / 1000),
      iat: Math.floor(Date.now() / 1000),
      sub: userId,
      iss: oidcCfg.PROVIDER_URL,
      aud: syscfg.API_URL,
      prismeaiSessionId: uuid(),
    };
    const jwt = await this.sign(token);
    return {
      token,
      jwt,
      expires: expires.toISOString(),
    };
  }
}

async function generateJWK(): Promise<JWK> {
  const jwk = await jose.JWK.createKey(JWKS_KTY, JWKS_SIZE, {
    alg: JWKS_ALG,
    use: 'sig',
  });
  return jwk.toJSON(true) as JWK;
}
