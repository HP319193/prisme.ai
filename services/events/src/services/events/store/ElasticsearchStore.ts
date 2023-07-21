import elasticsearch from '@elastic/elasticsearch';
import { StoreDriverOptions } from '.';
import {
  EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS,
  EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS,
  EVENTS_RETENTION_DAYS,
  EVENTS_SCHEDULED_DELETION_DAYS,
  EVENTS_STORAGE_ES_BULK_REFRESH,
} from '../../../../config';
import { EventType } from '../../../eda';
import { ObjectNotFoundError } from '../../../errors';
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
    const deletionScheduledPolicyName = `policy-events-deletion-scheduled${
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

    await this.client.ilm.putLifecycle({
      policy: deletionScheduledPolicyName,
      body: {
        policy: {
          phases: {
            delete: {
              min_age: `${EVENTS_SCHEDULED_DELETION_DAYS}d`,
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
              'source.appInstanceSlug': {
                type: 'keyword',
              },
              'source.automationDepth': {
                type: 'short',
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
          type: Array.isArray(options.types)
            ? options.types
            : (options.types as string).split(','),
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
                [typeof value === 'string' && value.includes('*')
                  ? 'wildcard'
                  : 'match']: {
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
      if (result.body._shards?.failed) {
        logger.warn({
          msg: 'Some Elasticsearch shards failed when querying events',
          shards: result.body._shards,
        });
      }
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
      {
        term: { 'source.serviceTopic': EventType.ExecutedAutomation },
      },
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

    const rootAutomationDepthFilter = {
      bool: {
        must_not: [
          {
            exists: { field: 'source.automationDepth' },
          },
          {
            match: { 'payload.trigger.type': 'automation' },
          },
        ],
      },
    };

    const metricAggs = {
      transactions: {
        cardinality: {
          field: 'source.correlationId',
        },
      },
      rootTriggers: {
        filter: rootAutomationDepthFilter,
        aggs: {
          types: {
            terms: { field: 'payload.trigger.type' },
            aggs: {
              transactions: {
                cardinality: {
                  field: 'source.correlationId',
                },
              },
            },
          },
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
      rootTriggers: ElasticBucket<{
        types: {
          buckets: ElasticBucket[];
        };
      }>;
      transactions: { value: number };
      users: { value: number };
    }>;

    const result: any = await this._search(
      workspaceId,
      { limit: 0 },
      {
        track_total_hits: true,
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
    const { hits, aggregations } = result;

    const mapMetricsElasticBuckets = (
      elasticBuckets: MetricsElasticBucket,
      automationRuns: number
    ): Prismeai.UsageMetrics => {
      const rootTriggers = mapElasticBuckets(
        elasticBuckets.rootTriggers?.types?.buckets || []
      );
      const transactions = elasticBuckets?.transactions?.value || 0;
      const metrics: Prismeai.UsageMetrics = {
        automationRuns,
        transactions,
        httpTransactions:
          rootTriggers?.endpoint?.buckets?.transactions?.value || 0,
        eventTransactions:
          rootTriggers?.event?.buckets?.transactions?.value || 0,
        scheduleTransactions:
          rootTriggers?.schedule?.buckets?.transactions?.value || 0,
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

    try {
      usage.apps = await this.getAppCustomUsage(
        workspaceId,
        options,
        usage.apps
      );
    } catch (err) {
      logger.warn({
        msg: 'Could not retrieve custom app usage',
        err,
        workspaceId,
      });
    }

    return usage;
  }

  async getAppCustomUsage(
    workspaceId: string,
    options: PrismeaiAPI.WorkspaceUsage.QueryParameters,
    apps: Prismeai.WorkspaceUsage['apps']
  ): Promise<Prismeai.WorkspaceUsage['apps']> {
    const filter: any = [
      { wildcard: { type: '*.usage' } },
      { term: { 'source.appInstanceDepth': 1 } },
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

    const usageAggregationPainless = (input: string) => `
    def reduce = [:];
    reduce["metrics"] = [:];
    reduce["fieldTimestamps"] = [:];
    // Loop over each metrics report
    for (record in ${input}) {

      // Loop over each individual metric
      for (entry in record.metrics.entrySet()) {
        def metricName = entry.getKey();
        def metric = entry.getValue();
        def value = false;
        def action = "set";
        // How old is this value ?
        def valueTimestamp = 0;
        if (record.containsKey('fieldTimestamps') && record.fieldTimestamps.containsKey(metricName)) {
          valueTimestamp = record.fieldTimestamps[metricName];
        } else if (record.containsKey('timestamp')) {
          valueTimestamp = record.timestamp;
        }

        // Retrieve value & action
        if (metric instanceof Map && metric.containsKey('value')) {
          value = metric.value;
          if (metric.containsKey('action') && metric.action instanceof String) {
            action = metric.action;
          }
        } else {
          value = metric;
        }

        // Check type
        if (value instanceof int || metric instanceof long || metric instanceof float || metric instanceof double || metric instanceof short || metric instanceof byte) {
          if (!reduce['fieldTimestamps'].containsKey(metricName)) {
            reduce['fieldTimestamps'][metricName] = valueTimestamp;
          }

          // Set or add
          if (!reduce["metrics"].containsKey(metricName) || action == "set") {
            // For set, check that is a newer value
            if (valueTimestamp >= reduce['fieldTimestamps'][metricName]) {
              reduce["metrics"][metricName] = value;
              reduce['fieldTimestamps'][metricName] = valueTimestamp;
            }
          } else {
            reduce["metrics"][metricName] += value;
          }
        }
      }
    }
    return reduce;
    `;
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
          apps: {
            terms: { field: 'source.appSlug' },
            aggs: {
              appInstances: {
                terms: {
                  field: 'source.appInstanceFullSlug',
                  size: 3000,
                },
                aggs: {
                  usage: {
                    scripted_metric: {
                      init_script: 'state.metrics = []',
                      // 1. Build each shard state from all documents
                      map_script: `
                        if (params['_source'].containsKey('payload') && params['_source'].payload.containsKey('metrics') && params['_source'].payload.metrics instanceof Map) {
                          Map record = [:];
                          record["metrics"] = params['_source'].payload.metrics;
                          record["timestamp"] = doc['createdAt'].value.getMillis();
                          state.metrics.add(record)
                        }`,

                      // Combine each shard state into a single value
                      combine_script: usageAggregationPainless('state.metrics'),

                      // Combine shards values into the final one
                      reduce_script: usageAggregationPainless('states'),
                    },
                  },
                },
              },
            },
          },
        },
      }
    );
    const { aggregations } = result;
    const appsUsage = mapElasticBuckets(aggregations.apps.buckets);
    return apps.map((cur) => {
      const appUsage = appsUsage[cur.slug!];
      if (!appUsage?.buckets?.appInstances?.buckets) {
        return cur;
      }
      const appInstancesUsage = mapElasticBuckets(
        appUsage?.buckets?.appInstances?.buckets
      );
      const metricsPerAppInstance: Record<
        string,
        Record<string, number>
      > = Object.entries(appInstancesUsage).reduce(
        (prevTotal, [appInstanceSlug, { buckets }]) => {
          if (!buckets?.usage?.value) {
            return prevTotal;
          }
          return {
            ...prevTotal,
            [appInstanceSlug]: buckets?.usage?.value?.metrics,
          };
        },
        {}
      );

      if (cur.appInstances) {
        cur.appInstances = cur.appInstances.map((cur) => {
          if (cur.slug && cur.slug in metricsPerAppInstance) {
            cur.total.custom = metricsPerAppInstance[cur.slug];
          }
          return cur;
        });
      }

      cur.total.custom = Object.values(metricsPerAppInstance).reduce(
        (prevCustom, cur) => ({
          ...Object.entries(cur).reduce(
            (prev, [k, v]) => ({
              ...prev,
              [k]: (prevCustom[k] || 0) + v,
            }),
            prevCustom
          ),
        }),
        {}
      );
      if (typeof (cur.total?.custom as any).billing === 'number') {
        (cur.total?.custom as any).billing = Math.floor(
          (cur.total?.custom as any).billing
        );
      }
      return cur;
    });
  }

  async closeWorkspace(workspaceId: string): Promise<any> {
    const index = this.getWorkspaceEventsIndexName(workspaceId);
    const scheduledDeletionPolicy = `policy-events-deletion-scheduled${
      this.namespace ? '-' + this.namespace : ''
    }`;
    // 1. Delete current ilm policy
    await this.client.ilm.removePolicy({
      index,
    });

    // 2. Apply deletion policy
    await this.client.indices.putSettings({
      index,
      body: {
        index: {
          lifecycle: {
            name: scheduledDeletionPolicy,
            origination_date: Date.now(),
          },
        },
      },
    });
  }

  async cleanupIndices(opts: { dryRun?: boolean }) {
    const now = Date.now();
    const { dryRun = false } = opts;

    const { aggregations } = await this._search(
      '*',
      { limit: 0 },
      {
        aggs: {
          group_by_workspaceId: {
            terms: {
              field: 'source.workspaceId',
              min_doc_count: 0,
              order: { _count: 'asc' },
              size: 100,
            },
            aggs: {
              max_date: { max: { field: 'createdAt' } },
              inactive_buckets: {
                bucket_selector: {
                  buckets_path: {
                    maxDate: 'max_date',
                  },
                  script: `
                  Instant lastEvent = Instant.ofEpochMilli(Double.valueOf(params.maxDate).longValue());
                  Instant now = Instant.ofEpochMilli(${now}L);

                  long diffDays = ChronoUnit.DAYS.between(lastEvent, now);
                  return diffDays > ${EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS};
                  `,
                },
              },
            },
          },
        },
      }
    );

    const workspaceBuckets = aggregations?.['group_by_workspaceId']?.[
      'buckets'
    ] as {
      key: string;
      doc_count: number;
      max_date: { value_as_string: string };
    }[];
    let cleanupWorkspaces: {
      workspaceId: string;
      lastEventDate: string;
      eventsCount: number;
    }[] = [];
    for (let bucket of workspaceBuckets) {
      if (bucket.doc_count > EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS) {
        break;
      }
      cleanupWorkspaces.push({
        workspaceId: bucket.key,
        lastEventDate: bucket.max_date.value_as_string,
        eventsCount: bucket.doc_count,
      });
    }

    if (dryRun !== false && <any>dryRun != 'false' && <any>dryRun != '0') {
      return {
        cleanupWorkspaces,
        dryRun,
      };
    }

    const result = await this.client.indices.deleteDataStream({
      name: cleanupWorkspaces.map((cur) =>
        this.getWorkspaceEventsIndexName(cur.workspaceId)
      ),
    });

    return {
      cleanupWorkspaces,
      result: result.body,
    };
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
  buckets?: ElasticBucket[];
} & AdditionalBuckets;

function mapElasticBuckets(
  buckets: ElasticBucket[]
): Record<string, { count: number; buckets: any }> {
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
