import {
  Job,
  Queue,
  QueueEvents,
  RedisOptions,
  Worker,
  RepeatOptions,
  JobsOptions,
} from 'bullmq';
import { parseExpression as parseCron } from 'cron-parser';
import { URL } from 'url';
import { SCHEDULES } from '../../../../config/schedules';
import { logger } from '../../../logger';
import { DetailedTrigger } from '../../workspaces';
import { SchedulesCallbacks } from '../types';
import { ISchedule } from './types';

export default class BullMQ implements ISchedule {
  private queue: Queue;
  private queueEvents: QueueEvents;
  private worker: Worker;

  public constructor({
    success: scheduleSuccess,
    error: scheduleError,
  }: SchedulesCallbacks) {
    this.queue = new Queue('schedules', {
      connection: parseRedisUrl(SCHEDULES.host),
      settings: {
        repeatStrategy,
      },
    });
    this.queueEvents = new QueueEvents('schedules', {
      connection: parseRedisUrl(SCHEDULES.host),
    });
    this.worker = new Worker(
      'schedules',
      async (job: Job) => {
        const {
          automationSlug,
          value: schedule,
          workspace: { id: workspaceId },
        } = job.data;

        return await scheduleSuccess({
          automationSlug,
          schedule,
          workspaceId,
        });
      },
      {
        connection: parseRedisUrl(SCHEDULES.host),
        concurrency: 15,
        settings: {
          repeatStrategy,
        },
      }
    );

    this.queueEvents.on('failed', async ({ jobId, failedReason }) => {
      const message = `Schedules : ${jobId} has failed with reason ${failedReason}`;
      logger.debug(message);

      const failedJob = await this.queue.getJob(jobId);

      const {
        workspace: { id: workspaceId },
      } = failedJob?.data;

      return await scheduleError({
        message: message,
        details: failedJob?.data,
        workspaceId,
      });
    });

    // Debug listeners, can be activated in production to monitor jobs.
    this.queueEvents.on('waiting', ({ jobId }) =>
      logger.debug(`Schedules : Job ${jobId} is waiting`)
    );
    this.queueEvents.on('active', ({ jobId, prev }) =>
      logger.debug(
        `Schedules: Job ${jobId} is now active; previous status was ${prev}`
      )
    );
    this.queueEvents.on('completed', ({ jobId, returnvalue }) =>
      logger.debug(`Schedules : ${jobId} has completed and returned.`)
    );
    this.queueEvents.on('stalled', ({ jobId }) =>
      logger.debug(`Schedules : Job ${jobId} stalled.`)
    );
  }

  async add(scheduleTriggers: DetailedTrigger[]) {
    const jobs: { name: string; data: any; opts: JobsOptions }[] =
      scheduleTriggers.map((trigger) => ({
        name: getJobId(trigger.workspace.id, trigger.automationSlug),
        data: { ...trigger },
        opts: {
          repeat: {
            pattern: trigger.value,
          },
          jobId: getJobId(trigger.workspace.id, trigger.automationSlug),
          removeOnComplete: SCHEDULES.removeOnComplete,
          removeOnFail: SCHEDULES.removeOnFail,
        },
      }));

    for (const job of jobs) {
      const { name, data, opts } = job;
      await this.queue.add(name, data, opts);
    }

    return jobs?.length;
  }

  async delete(workspaceId: string, automationSlug = '') {
    // Delete CAN delete multiple jobs at once either because :
    // - There is multiple schedules for one automation
    // - We asked to delete all the jobs of one workspace

    if (!workspaceId) return false;

    const jobs = await this.queue.getRepeatableJobs();
    const removableJobs = jobs.filter(({ id }) => {
      const targetJob = getJobId(workspaceId, automationSlug);
      if (targetJob.endsWith('*')) {
        return id.startsWith(targetJob.slice(0, -1));
      }
      return id.includes(targetJob);
    });

    for (const job of removableJobs) {
      await this.queue.removeRepeatableByKey(job.key);
    }

    return removableJobs?.length;
  }

  async close() {
    return await this.worker.close();
  }
}

// "parseRedisUrl" is necessary as long as this issue is opened:
// https://github.com/taskforcesh/bullmq/issues/1220
// Other options are not satifying enough.
export function parseRedisUrl(input: string): RedisOptions {
  const url = new URL(input);

  const options: RedisOptions = {};

  if (url.hostname) options.host = url.hostname;
  if (url.port) options.port = parseInt(url.port);
  if (url.username) options.username = url.username;
  if (SCHEDULES.password || url.password)
    options.password = SCHEDULES.password || url.password; // If the env variable specify a password we ovewrite.
  if (url.pathname.length > 1) options.db = parseInt(url.pathname.slice(1));

  return options;
}

export const repeatStrategy = (millis: number, opts: RepeatOptions): number => {
  // BullMQ default strategy
  const pattern = opts.pattern || '';

  if (pattern && opts.every) {
    throw new Error(
      'Both .pattern and .every options are defined for this repeatable job'
    );
  }

  if (opts.every) {
    return (
      Math.floor(millis / opts.every) * opts.every +
      (opts.immediately ? 0 : opts.every)
    );
  }
  const currentDate =
    opts.startDate && new Date(opts.startDate) > new Date(millis)
      ? new Date(opts.startDate)
      : new Date(millis);
  const interval = parseCron(pattern, {
    ...opts,
    currentDate,
  });
  let next = interval.next().getTime();

  // Custom behaviour to enforce a max occurence pattern
  // It prevents jobs to be triggered more times than defined by the occurence pattern
  if (SCHEDULES.maxOccurrencePattern) {
    const minInterval = parseCron(SCHEDULES.maxOccurrencePattern, {
      ...opts,
      currentDate,
    });
    const minNext = minInterval.next().getTime();

    if (next < minNext) {
      next = minNext;
    }
  }

  return next;
};

const getJobId = (workspaceId: string, automationSlug = '') => {
  return `${workspaceId}/${automationSlug}`;
};
