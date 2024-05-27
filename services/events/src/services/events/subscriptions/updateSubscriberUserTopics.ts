import { Permissions } from '@prisme.ai/permissions';
import { Subscriber } from './types';

export function updateSubscriberUserTopics(
  subscriber: Subscriber,
  topicName: string
) {
  const rules = subscriber.permissions?.ability?.rules || [];
  let topicAlreadyAllowed = false;
  //  For each subscriber, start to find permissions rules matching userTopics
  const userTopicRules = rules.filter((cur) => {
    if (!cur?.conditions?.['target.userTopic']) {
      return false;
    }
    if (Array.isArray(cur.action) && !cur.action.includes('read')) {
      return false;
    }
    if (typeof cur.action === 'string' && cur.action !== 'read') {
      return false;
    }
    if (Array.isArray(cur.subject) && !cur.subject.includes('events')) {
      return false;
    }
    if (typeof cur.subject === 'string' && cur.subject !== 'events') {
      return false;
    }
    const currentTopics =
      (cur?.conditions?.['target.userTopic'] as any)?.['$in'] ||
      cur?.conditions?.['target.userTopic'];
    if (
      currentTopics === topicName ||
      (Array.isArray(currentTopics) && currentTopics.includes(topicName))
    ) {
      topicAlreadyAllowed = true;
    }
    return Array.isArray(currentTopics);
  });

  if (topicAlreadyAllowed) {
    return;
  }

  // Update permissions rules
  if (!userTopicRules?.length) {
    // This subscriber didn't have any userTopic allowed ; create the corresponding rule
    rules.push({
      action: ['read'],
      subject: 'events',
      conditions: {
        'target.userTopic': {
          $in: [topicName],
        },
      },
    });
  } else {
    userTopicRules.forEach((cur) => {
      const currentTopics: string[] =
        (cur?.conditions?.['target.userTopic'] as any)?.['$in'] ||
        cur?.conditions?.['target.userTopic'];
      cur.conditions = {
        ...cur.conditions,
        'target.userTopic': {
          $in: Array.isArray(currentTopics)
            ? currentTopics.concat([topicName])
            : [topicName],
        },
      };
    });
  }

  // Rebuild permissions & emit
  subscriber.permissions = Permissions.buildFrom(rules);
  return subscriber;
}
