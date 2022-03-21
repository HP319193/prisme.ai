import elasticsearch from '@elastic/elasticsearch';
import { StoreDriverOptions } from '.';
import { EVENTS_RETENTION_DAYS } from '../../../../config';
import { logger } from '../../../logger';
import { EventsStore, SearchOptions } from './types';

export class ElasticsearchStore implements EventsStore {
  client: elasticsearch.Client;
  namespace?: string;

  constructor(opts: StoreDriverOptions, namespace?: string) {
    this.client = new elasticsearch.Client({
      node: opts.host,
      auth: opts.user
        ? {
            username: opts.user,
            password: opts.password,
          }
        : undefined,
      ...opts.driverOptions,
    });
    this.namespace = namespace;
    this.initializeConfiguration();
  }

  private async initializeConfiguration() {
    const policyName = `policy-events${
      this.namespace ? '-' + this.namespace : ''
    }`;
    const templateName = `template-events${
      this.namespace ? '-' + this.namespace : ''
    }`;
    const indexTemplateName = `index-template-events${
      this.namespace ? '-' + this.namespace : ''
    }`;

    const ROLLOVER_AT_DAYS = 30;
    await this.client.ilm.putLifecycle({
      policy: policyName,
      body: {
        policy: {
          phases: {
            hot: {
              actions: {
                rollover: {
                  max_age: `${ROLLOVER_AT_DAYS}d`,
                  max_size: '50GB',
                },
              },
            },
            delete: {
              min_age: `${EVENTS_RETENTION_DAYS - ROLLOVER_AT_DAYS}d`,
              actions: {
                delete: {},
              },
            },
          },
        },
      },
    });

    await this.client.cluster.putComponentTemplate({
      name: templateName,
      body: {
        template: {
          settings: {
            'index.lifecycle.name': policyName,
          },
          mappings: {
            properties: {
              createdAt: {
                type: 'date',
              },
              id: {
                type: 'keyword',
              },
              type: {
                type: 'keyword',
              },
              'source.correlationId': {
                type: 'keyword',
              },
              'source.workspaceId': {
                type: 'keyword',
              },
              'source.app': {
                type: 'keyword',
              },
              'source.userId': {
                type: 'keyword',
              },
              payload: {
                type: 'flattened',
              },
              'error.error': {
                type: 'keyword',
              },
              'error.message': {
                type: 'text',
              },
            },
          },
        },
      },
    });
    await this.client.indices.putIndexTemplate(
      {
        name: indexTemplateName,
        body: {
          index_patterns: [this.getWorkspaceEventsIndexName('*')],
          composed_of: [templateName],
          data_stream: {}, // Create data streams instead of indices
        },
      },
      {}
    );
  }

  private getWorkspaceEventsIndexName(workspaceId: string) {
    return `events${
      this.namespace ? '-' + this.namespace : ''
    }-${workspaceId}`.toLocaleLowerCase();
  }

  private buildSearchBody(options: SearchOptions) {
    let createdAtSort = 'desc';
    const additionalBody: any = {};
    const filter = [],
      must: any = [];

    if (options.afterDate) {
      filter.push({
        range: {
          createdAt: {
            gt: options.afterDate,
          },
        },
      });
    }

    if (options.beforeDate) {
      filter.push({
        range: {
          createdAt: {
            lt: options.beforeDate,
          },
        },
      });
    }

    if (options.types) {
      filter.push({
        terms: {
          type: options.types,
        },
      });
    }

    if (options.payloadQuery) {
      Object.entries(options.payloadQuery).forEach(([key, value]) => {
        must.push({
          match: {
            [key]: value,
          },
        });
      });
    }

    if (options.text) {
      must.push({
        query_string: {
          query: options.text,
        },
      });
    }

    return {
      sort: [{ createdAt: createdAtSort }],
      query: {
        bool: {
          filter,
          must,
        },
      },
      ...additionalBody,
    };
  }

  async search(
    workspaceId: string,
    options: SearchOptions = {}
  ): Promise<Prismeai.PrismeEvent[]> {
    const index = this.getWorkspaceEventsIndexName(workspaceId);
    const page = options.page || 0;
    const limit = options.limit || 50;
    try {
      const result = await this.client.search(
        {
          index,
          from: page * limit,
          size: limit,
          body: this.buildSearchBody(options),
        },
        {
          maxRetries: 3,
        }
      );
      return result.body.hits.hits.map((cur: any) => {
        delete cur._source['@timestamp'];
        return cur._source;
      });
    } catch (error: any) {
      if ((error?.message || '').startsWith('index_not_found_exception')) {
        return [];
      }
      throw error;
    }
  }

  private prepareBulkInsertBody(events: Prismeai.PrismeEvent[]) {
    return events
      .sort((a, b) =>
        a.source.workspaceId!! > b.source.workspaceId!! ? 1 : -1
      )
      .flatMap((cur) => {
        return [
          {
            // Automatically initialize data stream with "create" action
            create: {
              _index: this.getWorkspaceEventsIndexName(
                cur.source.workspaceId!!
              ),
              _id: cur.id,
            },
          },
          {
            '@timestamp': cur.createdAt,
            ...cur,
          },
        ];
      });
  }

  async bulkInsert(events: Prismeai.PrismeEvent[]): Promise<any> {
    const body = this.prepareBulkInsertBody(events);
    const result = await this.client.bulk({
      refresh: true,
      body,
    });
    if (result.body.errors) {
      logger.error({
        msg: 'Elasticsearch store raised an exception during bulk insert',
        errors: result.body.items,
      });
    }
  }
}
