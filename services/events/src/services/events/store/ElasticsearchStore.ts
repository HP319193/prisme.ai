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
                  max_size: '40GB',
                  max_primary_shard_size: '40GB',
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
        term: { 'source.serviceTopic': EventType.TriggeredInteraction },
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

    const metricAggs = {
      transactions: {
        cardinality: {
          field: 'source.correlationId',
        },
      },
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
      types: {
        buckets: ElasticBucket[];
      };
      transactions: { value: number };
      users: { value: number };
    }>;

    const result: any = await this._search(
      workspaceId,
      { limit: 10 },
      {
        track_total_hits: true,
        query: {
          bool: {
            filter,
          },
        },

        aggs: metricAggs,
      }
    );
    const { aggregations } = result;

    const mapMetricsElasticBuckets = (
      elasticBuckets: MetricsElasticBucket
    ): Prismeai.UsageMetrics => {
      const rootTriggers = mapElasticBuckets(
        elasticBuckets.types?.buckets || []
      );
      const transactions = elasticBuckets?.transactions?.value || 0;
      const metrics: Prismeai.UsageMetrics = {
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
      total: mapMetricsElasticBuckets(aggregations),
      apps: [],
    };

    try {
      usage.apps = await this.getAppCustomUsage(workspaceId, options);
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
    options: PrismeaiAPI.WorkspaceUsage.QueryParameters
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
    return Object.entries(appsUsage).reduce(
      (prevApps, [appSlug, { buckets }]) => {
        if (!buckets?.appInstances?.buckets) {
          return prevApps;
        }

        const appUsage = {
          slug: appSlug,
          total: {
            custom: {},
          },
          appInstances: [],
        };

        const appInstancesUsage = mapElasticBuckets(
          buckets?.appInstances?.buckets
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

        appUsage.appInstances = buckets?.appInstances?.buckets.map(
          (cur: any) => {
            return {
              slug: cur.key,
              total: {
                custom: metricsPerAppInstance[cur.key],
              },
            };
          }
        );

        appUsage.total.custom = Object.values(metricsPerAppInstance).reduce(
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
        if (typeof (appUsage.total?.custom as any).billing === 'number') {
          (appUsage.total?.custom as any).billing = Math.floor(
            (appUsage.total?.custom as any).billing
          );
        }

        return [...prevApps, appUsage];
      },
      [] as Prismeai.AppUsageMetrics[]
    );
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

    // 3. Close index
    await this.client.indices.close({
      index: `.ds-${this.getWorkspaceEventsIndexName(`${workspaceId}-*`)}`,
    });
  }

  async cleanupIndices(opts: { dryRun?: boolean }) {
    const { dryRun = false } = opts;

    const extractWorkspaceIdFromindex = (index: string) => {
      const withoutRolloutNb = index.slice(0, index.lastIndexOf('-'));
      const withoutDate = withoutRolloutNb.slice(
        0,
        withoutRolloutNb.lastIndexOf('-')
      );
      return withoutDate.slice(
        `.ds-${this.getWorkspaceEventsIndexName('')}`.length
      );
    };
    // 1. List shards with their respective doc count
    const { body: indices } = await this.client.cat.shards({
      index: `.ds-${this.getWorkspaceEventsIndexName('*')}`,
      format: 'json',
    });

    // & list data streams
    const { body: datastreams } = await this.client.indices.dataStreamsStats();
    const knownDatastreams = new Set(
      datastreams.data_streams.map((cur: any) => cur.data_stream)
    );

    // 2. Map doc count to workspace ids & list empty indices
    let emptyIndices: string[] = [];
    const indicesWithoutDatastream: string[] = [];
    const indicesStats: Record<
      string,
      {
        count: number;
        lastIndex: string;
      }
    > = indices.reduce(
      (
        smallWorkspaces: Record<
          string,
          {
            count: number;
            lastIndex: string;
          }
        >,
        cur: { index: string; docs: string; prirep: string; state: string }
      ) => {
        if (
          cur.prirep !== 'p' ||
          cur.state !== 'STARTED' ||
          cur.docs === null
        ) {
          return smallWorkspaces;
        }
        const currentIndexDocsCount = parseInt(cur.docs || '0');
        const workspaceId = extractWorkspaceIdFromindex(cur.index);
        if (currentIndexDocsCount == 0) {
          emptyIndices.push(cur.index);
        }
        const lastValues = smallWorkspaces?.[workspaceId];
        return {
          ...smallWorkspaces,
          [workspaceId]: {
            count: (lastValues?.count || 0) + currentIndexDocsCount,
            lastIndex:
              lastValues?.lastIndex && lastValues?.lastIndex > cur.index
                ? lastValues?.lastIndex
                : cur.index,
          },
        };
      },
      {}
    );

    // 3.Filter small workspace ids
    const smallWorkspaceIds = Object.entries(indicesStats)
      .filter(([workspaceId, { count }]) => {
        const datastreamName = this.getWorkspaceEventsIndexName(workspaceId);
        if (!knownDatastreams.has(datastreamName)) {
          indicesWithoutDatastream.push(`.ds-${datastreamName}-*`);
          return false;
        }
        return count <= EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS;
      })
      .map(([workspaceId, {}]) => workspaceId);

    // 4. Fetch last events from each small datastream
    const lastEvents = await this.client.search({
      size: smallWorkspaceIds.length,
      index: smallWorkspaceIds.map((cur) =>
        this.getWorkspaceEventsIndexName(cur)
      ),
      body: {
        sort: [
          {
            '@timestamp': 'desc',
          },
        ],
        query: {
          bool: {
            must_not: {
              terms: {
                type: ['error'], // Do not count error events as an 'activity' indicator, as they can come from automated tasks
              },
            },
          },
        },
        collapse: {
          field: 'source.workspaceId',
        },
      },
    });

    // 5. Calculate inactivity days from small datastreams
    const inactivityDaysByWorkspaceId = lastEvents.body.hits.hits.reduce(
      (lastDatesByWorkspaceId: Record<string, string>, cur: any) => {
        const workspaceId = extractWorkspaceIdFromindex(cur._index);
        const inactivityDays =
          (Date.now() - new Date(cur._source.createdAt).getTime()) /
          (1000 * 3600 * 24);
        return {
          ...lastDatesByWorkspaceId,
          [workspaceId]: Math.round(inactivityDays),
        };
      },
      {}
    );

    // 6. List small & inactive datastreams that we want to delete
    const deleteDatastreams = smallWorkspaceIds
      .filter((workspaceId) => {
        // If only events are error (skipped from request), delete
        if (!(workspaceId in inactivityDaysByWorkspaceId)) {
          return true;
        }

        // If exceeds inactivity threshold, delete
        if (
          inactivityDaysByWorkspaceId[workspaceId] >
          EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS
        ) {
          return true;
        }
        return false;
      })
      .map((workspaceId) => ({
        name: this.getWorkspaceEventsIndexName(workspaceId),
        workspaceId,
        inactivityDays: inactivityDaysByWorkspaceId[workspaceId],
        docsCount: indicesStats[workspaceId].count,
      }));

    const writingIndices = new Set(
      Object.values(indicesStats).map((cur) => cur.lastIndex)
    );
    // Exclude writting index from empty indices as we cannot delete them
    emptyIndices = emptyIndices.filter((cur) => !writingIndices.has(cur));
    if (dryRun !== false && <any>dryRun != 'false' && <any>dryRun != '0') {
      return {
        indicesWithoutDatastream,
        inactiveDatastreams: { found: deleteDatastreams },
        emptyIndices: { found: emptyIndices },
        dryRun,
      };
    }

    const deleteDatastreamsResult = deleteDatastreams?.length
      ? await this.client.indices.deleteDataStream({
          name: deleteDatastreams.map((cur) => cur.name),
        })
      : {};

    const deleteEmptyIndicesResult = emptyIndices?.length
      ? await this.client.indices.delete({
          index: emptyIndices,
          ignore_unavailable: true,
        })
      : {};

    return {
      indicesWithoutDatastream,
      inactiveDatastreams: {
        found: deleteDatastreams,
        result: deleteDatastreamsResult,
      },
      emptyIndices: {
        found: emptyIndices,
        result: deleteEmptyIndicesResult,
      },
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
