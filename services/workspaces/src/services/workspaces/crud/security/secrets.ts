// @ts-ignore
import { hri } from 'human-readable-ids';
import { AccessManager, SubjectType } from '../../../../permissions';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import {
  Diffs,
  getObjectsDifferences,
} from '../../../../utils/getObjectsDifferences';
import { ObjectNotFoundError } from '../../../../errors';
import { logger } from '../../../../logger';
import { interpolate } from '../../../../utils/interpolate';

export class Secrets {
  private accessManager: Required<AccessManager>;
  private broker: Broker;

  constructor(accessManager: Required<AccessManager>, broker: Broker) {
    this.accessManager = accessManager;
    this.broker = broker;
  }

  getSecrets = async (
    workspaceId: string
  ): Promise<Prismeai.WorkspaceSecrets> => {
    const data = await this.accessManager.findAll(
      SubjectType.Secret,
      {
        workspaceId,
      },
      {
        pagination: {
          limit: 9999,
        },
      }
    );
    return data.reduce((secrets, { name, workspaceId: _, ...cur }) => {
      if (cur.type === 'object' && typeof cur.value === 'string') {
        try {
          cur.value = JSON.parse(cur.value);
        } catch {}
      }
      if (cur.description === '') {
        delete cur.description;
      }
      return {
        ...secrets,
        [name!]: cur,
      };
    }, {});
  };

  interpolateSecrets = async <T>(workspaceId: string, data: T): Promise<T> => {
    const secrets = await this.accessManager.__unsecureFind(
      SubjectType.Secret,
      {
        workspaceId,
      },
      {
        pagination: {
          limit: 9999,
        },
      }
    );
    const ctx = {
      secret: secrets.reduce((secrets, { name, type, value }) => {
        if (type === 'object' && typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch {}
        }
        return {
          ...secrets,
          [name!]: value,
        };
      }, {}),
    };

    return interpolate(data, ctx);
  };

  updateSecrets = async (
    workspaceId: string,
    secrets: PrismeaiAPI.UpdateWorkspaceSecrets.RequestBody,
    opts: {
      mode: 'put' | 'patch';
    }
  ): Promise<Prismeai.WorkspaceSecrets> => {
    const currentSecrets = await this.getSecrets(workspaceId);
    const diffs = getObjectsDifferences(currentSecrets, secrets, [
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'permissions',
      'id',
      'type',
    ]);

    if (diffs.__type === 'unchanged') {
      return currentSecrets;
    }

    const deleted: string[] = [],
      updated: string[] = [],
      created: string[] = [];
    // Update or create given secrets
    const queries = Object.entries(diffs?.data as Record<string, Diffs>).map(
      ([name, { __type }]) => {
        if (__type == 'deleted') {
          if (opts?.mode === 'put' && currentSecrets[name].id) {
            deleted.push(name);
            return this.accessManager.delete(
              SubjectType.Secret,
              currentSecrets[name].id
            );
          }
          return true;
        }

        const update = secrets[name];
        const data = {
          ...update,
          name,
          type: typeof update.value as any,
          value:
            typeof update.value === 'object'
              ? JSON.parse(update.value)
              : update.value,
          description: update.description || '',
          workspaceId,
        };

        if (__type === 'created') {
          created.push(name);
          return this.accessManager.create(SubjectType.Secret, data);
        } else if (__type === 'updated' && currentSecrets[name].id) {
          updated.push(name);
          return this.accessManager.update(SubjectType.Secret, {
            ...data,
            id: currentSecrets[name].id,
          });
        }
        return true;
      }
    );

    await Promise.all(queries);

    this.broker
      .send<Prismeai.UpdatedWorkspaceSecrets['payload']>(
        EventType.UpdatedWorkspaceSecrets,
        {
          deleted,
          created,
          updated,
        }
      )
      .catch((err) => logger.error({ err }));

    return await this.getSecrets(workspaceId);
  };

  deleteSecret = async (workspaceId: string, secretName: string) => {
    const ret = await this.accessManager.deleteMany(SubjectType.Secret, {
      workspaceId,
      name: secretName,
    });
    if (ret?.length === 0) {
      throw new ObjectNotFoundError(`Secret '${secretName}' not found`);
    }
    this.broker
      .send<Prismeai.UpdatedWorkspaceSecrets['payload']>(
        EventType.UpdatedWorkspaceSecrets,
        {
          deleted: [secretName],
        }
      )
      .catch((err) => logger.error({ err }));
    return { secretName };
  };
}
