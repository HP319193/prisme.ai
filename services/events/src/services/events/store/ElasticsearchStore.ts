import elasticsearch from '@elastic/elasticsearch';
import { StoreDriverOptions } from '.';
import {
  EVENTS_RETENTION_DAYS,
  EVENTS_STORAGE_ES_BULK_REFRESH,
} from '../../../../config';
import { EventType } from '../../../eda';
import { InvalidFiltersError, ObjectNotFoundError } from '../../../errors';
import { logger } from '../../../logger';
import { preprocess } from './preprocess';
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
              'source.userId': {
                type: 'keyword',
              },
              'source.sessionId': {
                type: 'keyword',
              },
              'source.workspaceId': {
                type: 'keyword',
              },
              'source.appSlug': {
                type: 'keyword',
              },
              'source.appInstanceFullSlug': {
                type: 'keyword',
              },
              'source.automationSlug': {
                type: 'keyword',
              },
              'source.topic': {
                type: 'keyword',
              },
              'target.userTopic': {
                type: 'keyword',
              },
              'source.serviceTopic': {
                type: 'keyword',
              },
              payload: {
                type: 'flattened',
                ignore_above: 32700,
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
    let createdAtSort = options.sort || 'desc';
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

    if (typeof options.appInstanceDepth === 'number') {
      filter.push({
        bool: {
          should: [
            {
              range: {
                'source.appInstanceDepth': {
                  lte: `${options.appInstanceDepth}`,
                },
              },
            },
            {
              bool: {
                must_not: {
                  exists: {
                    field: 'source.appInstanceDepth',
                  },
                },
              },
            },
          ],
        },
      });
    }

    if (options.payloadQuery) {
      Object.entries(options.payloadQuery).forEach(([key, value]) => {
        must.push(
          Array.isArray(value)
            ? {
                query_string: {
                  query: `${value
                    .map((v) => (v ? `${key}:"${v}"` : `not ${key}`))
                    .join(' OR ')}`,
                },
              }
            : {
                match: {
                  [key]: value,
                },
              }
        );
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

  async values(
    workspaceId: string,
    options: SearchOptions,
    fields: string[],
    size = 500
  ): Promise<PrismeaiAPI.EventsValues.Responses.$200['result']> {
    const body = this.buildSearchBody(options);
    body.aggs = fields.reduce(
      (aggs, field) => ({
        ...aggs,
        [field]: {
          terms: {
            field,
            size,
          },
        },
      }),
      {}
    );

    try {
      const { aggregations } = await this._search(
        workspaceId,
        { ...options, limit: 0 },
        body
      );
      return Object.entries(aggregations || {}).reduce(
        (values, [field, { buckets }]: any) => ({
          ...values,
          [field]: buckets.map(
            ({
              key: value,
              doc_count: count,
            }: {
              key: string;
              doc_count: number;
            }) => ({
              value,
              count,
            })
          ),
        }),
        {}
      );
    } catch (error) {
      if (
        ((<any>error)?.message || '').includes('Text fields are not optimised')
      ) {
        throw new InvalidFiltersError(
          `Can't retrieve distinct values from one of the requested fields as it looks like a 'text' field and not a 'keyword'`
        );
      }
      throw error;
    }
  }

  async _search(
    workspaceId: string,
    options: SearchOptions = {},
    body: any
  ): Promise<elasticsearch.ApiResponse['body']> {
    const index = this.getWorkspaceEventsIndexName(workspaceId);
    const page = options.page || 0;
    const limit = typeof options.limit !== 'undefined' ? options.limit : 50;
    try {
      const result = await this.client.search(
        {
          index,
          from: page * limit,
          size: limit,
          body,
        },
        {
          maxRetries: 3,
        }
      );
      return result.body;
    } catch (error: any) {
      if ((error?.message || '').startsWith('index_not_found_exception')) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async search(
    workspaceId: string,
    options: SearchOptions = {}
  ): Promise<Prismeai.PrismeEvent[]> {
    try {
      const result = await this._search(
        workspaceId,
        options,
        this.buildSearchBody(options)
      );
      return result.hits.hits.map((cur: any) => {
        delete cur._source['@timestamp'];
        return cur._source;
      });
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
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
        const preprocessedEvent = preprocess(cur);
        if (!preprocessedEvent) {
          return [];
        }
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
            ...preprocessedEvent,
          },
        ];
      });
  }

  async bulkInsert(events: Prismeai.PrismeEvent[]): Promise<any> {
    const body = this.prepareBulkInsertBody(events);
    const result = await this.client.bulk({
      refresh: EVENTS_STORAGE_ES_BULK_REFRESH,
      body,
    });
    if (result.body.errors) {
      logger.error({
        msg: 'Elasticsearch store raised an exception during bulk insert',
        errors: result.body.items,
      });
    }
  }

  async workspaceUsage(
    workspaceId: string,
    options: PrismeaiAPI.WorkspaceUsage.QueryParameters
  ): Promise<Prismeai.WorkspaceUsage> {
    const filter: any = [
      { term: { 'source.serviceTopic': EventType.ExecutedAutomation } },
    ];
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

    const metricAggs = {
      triggerTypes: {
        terms: { field: 'payload.trigger.type' },
      },
      transactions: {
        cardinality: {
          field: 'source.correlationId',
          missing: 'N/A',
        },
      },
      sessions: {
        cardinality: {
          field: 'source.sessionId',
        },
      },
      users: {
        cardinality: {
          field: 'source.userId',
        },
      },
    };
    type MetricsElasticBucket = ElasticBucket<{
      triggerTypes: ElasticBucket;
      transactions: { value: number };
      users: { value: number };
    }>;

    const result: any = await this._search(
      workspaceId,
      { limit: 0 },
      {
        query: {
          bool: {
            filter,
          },
        },

        aggs: {
          ...metricAggs,
          apps: {
            terms: { field: 'source.appSlug' },
            aggs: {
              ...metricAggs,
              appInstances: {
                terms: { field: 'source.appInstanceFullSlug' },
                aggs: metricAggs,
              },
            },
          },
        },
      }
    );
    const { _shards, hits, aggregations } = result;
    if (_shards?.failed) {
      logger.warn({
        msg: 'Some Elasticsearch shards failed when agggregating workspace usage',
        shards: _shards,
      });
    }

    const mapMetricsElasticBuckets = (
      elasticBuckets: MetricsElasticBucket,
      automationRuns: number
    ): Prismeai.UsageMetrics => {
      const nonEventTriggers = (
        elasticBuckets.triggerTypes?.buckets || []
      ).reduce((total: number, { key, doc_count }: ElasticBucket) => {
        return key === 'event' || key === 'automation'
          ? total
          : total + doc_count;
      }, 0);
      const triggerTypes = mapElasticBuckets(
        elasticBuckets.triggerTypes?.buckets || []
      );
      const transactions = elasticBuckets?.transactions?.value || 0;
      const metrics: Prismeai.UsageMetrics = {
        automationRuns,
        transactions,
        httpTransactions: triggerTypes?.endpoint?.count || 0,
        eventTransactions: transactions - nonEventTriggers,
        sessions: aggregations?.sessions?.value,
        users: aggregations?.users?.value,
      };

      return metrics;
    };

    const usage: Prismeai.WorkspaceUsage = {
      workspaceId,
      beforeDate: options.beforeDate,
      afterDate: options.afterDate,
      total: mapMetricsElasticBuckets(aggregations, hits?.total?.value || 0),
      apps: (aggregations?.apps?.buckets || []).map(
        ({ key: slug, doc_count, appInstances, ...metricBuckets }: any) => {
          const appUsage: Prismeai.AppUsageMetrics = {
            slug,
            total: mapMetricsElasticBuckets(metricBuckets, doc_count),
          };
          if (options.details) {
            appUsage.appInstances = (appInstances?.buckets || []).map(
              ({ key: slug, doc_count, ...metricBuckets }: any) => {
                return {
                  slug,
                  total: mapMetricsElasticBuckets(metricBuckets, doc_count),
                };
              }
            );
          }

          return appUsage;
        }
      ),
    };

    return usage;
  }
}

type ElasticBucket<
  AdditionalBuckets = Record<
    string,
    {
      buckets: ElasticBucket[];
    }
  >
> = {
  key: string;
  doc_count: number;
  buckets: ElasticBucket[];
} & AdditionalBuckets;

function mapElasticBuckets(buckets: ElasticBucket[]) {
  return buckets.reduce(
    (prev: any, { key, doc_count, ...buckets }: any) => ({
      ...prev,
      [key]: {
        count: doc_count,
        buckets,
      },
    }),
    {}
  );
}
