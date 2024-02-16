import { ElasticBucket } from './types';

export const EVENTS_MAPPING = {
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
};

export function mergeArrays(firstArray: any[] = [], secondArray: any[] = []) {
  const mergedMap = new Map();

  for (const item of firstArray) {
    mergedMap.set(item.date, { ...item });
  }

  for (const item of secondArray) {
    mergedMap.set(item.date, { ...mergedMap.get(item.date), ...item });
  }

  const mergedArray = [...mergedMap.values()];

  mergedArray.sort((a, b) => a.date.localeCompare(b.date));

  return mergedArray;
}

export function mapElasticBuckets(
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
