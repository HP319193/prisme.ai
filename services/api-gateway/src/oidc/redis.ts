import isEmpty from 'lodash/isEmpty.js';
import { storage } from '../config';
import RedisCache from '../cache/redis';

const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);

const consumable = new Set([
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);

function grantKeyFor(id: string) {
  return `grant:${id}`;
}

function userCodeKeyFor(userCode: string) {
  return `userCode:${userCode}`;
}

function uidKeyFor(uid: string) {
  return `uid:${uid}`;
}

class RedisAdapter {
  name: string;
  driver: RedisCache;

  constructor(name: string) {
    this.name = name;
    this.driver = new RedisCache({
      ...storage.Sessions,
      prefix: 'oidc:',
    });
    this.driver.connect();
  }

  async upsert(id: string, payload: any, expiresIn: number) {
    const client = this.driver.client;
    const key = this.key(id);
    const store = consumable.has(this.name)
      ? { payload: JSON.stringify(payload) }
      : JSON.stringify(payload);

    const multi = client.multi();
    multi[consumable.has(this.name) ? 'hSet' : 'set'](key, store as any);

    if (expiresIn) {
      multi.expire(key, expiresIn);
    }

    if (grantable.has(this.name) && payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rPush(grantKey, key);
      // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
      // here to trim the list to an appropriate length
      const ttl = await client.ttl(grantKey);
      if (expiresIn > ttl) {
        multi.expire(grantKey, expiresIn);
      }
    }

    if (payload.userCode) {
      const userCodeKey = userCodeKeyFor(payload.userCode);
      multi.set(userCodeKey, id);
      multi.expire(userCodeKey, expiresIn);
    }

    if (payload.uid) {
      const uidKey = uidKeyFor(payload.uid);
      multi.set(uidKey, id);
      multi.expire(uidKey, expiresIn);
    }

    await multi.exec();
  }

  async find(id: string) {
    const client = this.driver.client;
    const data = consumable.has(this.name)
      ? await client.hGetAll(this.key(id))
      : await client.get(this.key(id));

    if (isEmpty(data)) {
      return undefined;
    }

    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    const { payload, ...rest } = data as any;
    return {
      ...rest,
      ...JSON.parse(payload),
    };
  }

  async findByUid(uid: string) {
    const client = this.driver.client;
    const id = await client.get(uidKeyFor(uid));
    if (!id) {
      return undefined;
    }
    return this.find(id);
  }

  async findByUserCode(userCode: string) {
    const client = this.driver.client;
    const id = await client.get(userCodeKeyFor(userCode));
    if (!id) {
      return undefined;
    }
    return this.find(id);
  }

  async destroy(id: string) {
    const client = this.driver.client;
    const key = this.key(id);
    await client.del(key);
  }

  async revokeByGrantId(grantId: string) {
    // eslint-disable-line class-methods-use-this
    const client = this.driver.client;
    const multi = client.multi();
    const tokens = await client.lRange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token) => multi.del(token));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  async consume(id: string) {
    const client = this.driver.client;
    await client.hSet(this.key(id), 'consumed', Math.floor(Date.now() / 1000));
  }

  key(id: string) {
    return `oidc:${this.name}:${id}`;
  }
}

export default RedisAdapter;
