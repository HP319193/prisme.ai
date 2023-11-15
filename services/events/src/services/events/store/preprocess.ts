import { logger } from '../../../logger';
import fs from 'fs';
import { redact } from '../../../utils';
import { PREPROCESSING_RULES_FILEPATH } from '../../../../config/preprocessing';

export interface PreprocessRule {
  topics?: string[];
  events?: string[];
  fields?: string[];
  action: 'redact';
  id: string;
}

export function preprocess(event: Prismeai.PrismeEvent) {
  const alreadyPreprocessed = new Set();
  const matchingRules = (rules.topics[event?.source?.serviceTopic || ''] || [])
    .concat(rules.events[event?.type] || [])
    .filter(
      (cur) =>
        (!cur.topics?.length ||
          cur.topics.includes(event.source?.serviceTopic || '')) &&
        (!cur.events?.length || cur.events?.includes(event.type))
    );
  for (const rule of matchingRules) {
    if (alreadyPreprocessed.has(rule.id)) {
      continue;
    }
    alreadyPreprocessed.add(rule.id);
    try {
      if (rule.action === 'redact') {
        if (!rule.fields) {
          return null;
        }
        redact(event, rule.fields);
      }
    } catch (err) {
      logger.error({
        msg: 'An error raised while preprocessing an event',
        event,
        err,
      });
    }
  }
  return event;
}

function indexPreprocessRules(rules: PreprocessRule[]): IndexedRules {
  return rules.reduce<IndexedRules>(
    (rules, cur) => {
      for (const event of cur.events || []) {
        if (!(event in rules.events)) {
          rules.events[event] = [];
        }
        rules.events[event].push(cur);
      }

      for (const event of cur.topics || []) {
        if (!(event in rules.events)) {
          rules.events[event] = [];
        }
        rules.events[event].push(cur);
      }
      return rules;
    },
    { topics: {}, events: {} }
  );
}

interface IndexedRules {
  topics: Record<string, PreprocessRule[]>;
  events: Record<string, PreprocessRule[]>;
}

let rules: IndexedRules = { events: {}, topics: {} };
try {
  const config = JSON.parse(
    fs.readFileSync(PREPROCESSING_RULES_FILEPATH) as any as string
  );
  rules = indexPreprocessRules(config);
} catch (err) {
  logger.error({
    msg: `Failed loading preprocessing rules. No preprocessing will be applied`,
    err,
  });
}
