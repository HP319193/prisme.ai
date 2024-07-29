/**
 * Expose a writeable stream and execute it as a set of bulk requests.
 */
'use strict';

import { Stream } from 'stream';
import { logger } from '../logger';

type BulkExec<T> = (
  bulk: T[]
) => Promise<{ throttle?: boolean; retryItems: T[] }>;
export interface BatchExecStreamOptions<T> {
  bulkExec: BulkExec<T>;
  highWaterMark?: number; // This is when stream.write returns false (and asks caller to call again later)
  flushAt?: number; // Automatically flush when "flushAt" chunks are pending. Cannot be greater than "highWaterMark"
  flushEvery?: number; // Without regards to "flushAt" parameter, flush every N milliseconds
  maximumBulkSize?: number; // This is the maximum number of documents flushed (i.e passed to bulkExec) at the same time. Defaults to highWaterMark
  maximumRetries?: number; // Maximum number of time we can retry rate limited items
  retryInterval?: number; // Interval in ms after which rate limited items are retried.
  exponentialBackoffRate?: number; // If back off rate is 1.5, a second retry will equal to {{retryInterval}} *  1.5 ** 2
  maximumRetryInterval?: number; // Maximum retry interval after exponential backoff
}

type StreamNext = (error?: Error | null) => void;

export default class BatchExecStream<T> extends Stream.Writable {
  private bulk: T[];
  private bulkCount: number;
  private bulkExec: BulkExec<T>;

  private highWaterMark: number;
  private flushAt: number;
  private flushEvery: number;
  private flushEveryTimeout: NodeJS.Timer;
  private maximumBulkSize: number;
  private maximumRetries: number;
  private retriesCounter: number; // Number of successive RateLimit failures, needed to adjust 'pauseUntil' with an exponential backoff
  private pauseUntil?: number; // Resume timestamp after a 429 rate limit
  private retryInterval: number;
  private exponentialBackoffRate: number;
  private maximumRetryInterval: number;

  constructor(opts: BatchExecStreamOptions<T>) {
    const highWaterMark = opts.highWaterMark || 256;
    super({
      objectMode: true,
      highWaterMark: highWaterMark,
    });

    this.highWaterMark = highWaterMark;
    this.maximumBulkSize = opts?.maximumBulkSize || highWaterMark;
    this.flushAt = opts.flushAt || 128;
    this.flushEvery = opts.flushEvery || 5000;
    if (this.flushAt > this.highWaterMark) {
      throw new Error(
        'BatchExecStream flushAt parameter cannot be greater than highWaterMark'
      );
    }
    this.bulk = [];
    this.bulkCount = 0;
    this.bulkExec = opts.bulkExec;
    this.retriesCounter = 0;
    this.maximumRetries = opts?.maximumRetries || 5;
    this.retryInterval = opts?.retryInterval || 1000;
    this.exponentialBackoffRate = opts?.exponentialBackoffRate || 1.5;
    this.maximumRetryInterval = opts?.maximumRetryInterval || 30000;

    this.flushEveryTimeout = setInterval(
      () => this.flush(() => undefined),
      this.flushEvery
    );
    this.on('finish', () => {
      this.flush(() => {
        this.emit('close');
        clearTimeout(this.flushEveryTimeout);
      }, true);
    });
  }

  _write(chunk: T, enc: BufferEncoding, next: StreamNext) {
    this.bulk.push(chunk);
    this.bulkCount++;
    if (this.bulkCount >= this.flushAt) {
      this.flush(next);
      return;
    }
    next();
  }

  async onClosed() {
    return await new Promise((resolve) => this.once('close', resolve));
  }

  async nextDrain() {
    return await new Promise((resolve) => this.once('drain', resolve));
  }

  async writeAndWait(chunk: T) {
    if (!this.write(chunk)) {
      await this.nextDrain();
    }
  }

  private async flush(callback: () => void, closed?: boolean) {
    const now = Date.now();
    if (
      !this.bulkCount ||
      (!closed && this.pauseUntil && now < this.pauseUntil)
    ) {
      callback();
      return;
    }
    const bulkSize =
      this.bulk.length > this.maximumBulkSize
        ? this.maximumBulkSize
        : this.bulk.length;
    const bulk = this.bulk.slice(0, bulkSize);
    this.bulk = this.bulk.slice(bulkSize);
    this.bulkCount = this.bulk.length;
    try {
      const ret = await this.bulkExec(bulk);

      // Exponential backoff in case of 429 RateLimit errors
      if (ret?.throttle && !closed) {
        this.retriesCounter += 1;
        let backoff =
          this.retryInterval *
          this.exponentialBackoffRate ** this.retriesCounter;
        if (backoff > this.maximumRetryInterval) {
          backoff = this.maximumRetryInterval;
        }
        logger.error({
          msg: `Rate limited events bulk insert n°${this.retriesCounter}, retrying in ${backoff} ms ...`,
          retries: this.retriesCounter,
          nextRetry: backoff,
          items: bulk.length,
        });
        this.pauseUntil = now + backoff;
      } else if (this.retriesCounter) {
        this.retriesCounter = 0;
      }

      if (
        ret?.retryItems?.length &&
        this.retriesCounter <= this.maximumRetries
      ) {
        this.bulk.push(...ret.retryItems);
        this.bulkCount += ret.retryItems.length;
      } else if (ret?.retryItems?.length) {
        logger.error({
          msg: `Could not persist ${ret?.retryItems?.length} items after ${this.retriesCounter} retries.`,
          retries: this.retriesCounter,
        });
      }

      callback();
    } catch (error) {
      logger.error({
        msg: 'An error raised while flushing events persistence queue',
        err: error,
      });
      callback();
      return;
    }
  }
}
