/**
 * Expose a writeable stream and execute it as a set of bulk requests.
 */
"use strict";

import { Stream } from "stream";
import { logger } from "../logger";

export interface BatchExecStreamOptions<T> {
  bulkExec: (bulk: T[]) => void;
  highWaterMark?: number; // This is when stream.write returns false (and asks caller to call again later)
  flushAt?: number; // Automatically flush when "flushAt" chunks are pending. Cannot be greater than "highWaterMark"
  flushEvery?: number; // Without regards to "flushAt" parameter, flush every N milliseconds
}

type StreamNext = (error?: Error | null) => void;

export default class BatchExecStream<T> extends Stream.Writable {
  private bulk: T[];
  private bulkCount: number;
  private bulkExec: (bulk: T[]) => void;

  private highWaterMark: number;
  private flushAt: number;
  private flushEvery: number;
  private flushEveryTimeout: NodeJS.Timer;

  constructor(opts: BatchExecStreamOptions<T>) {
    const highWaterMark = opts.highWaterMark || 256;
    super({
      objectMode: true,
      highWaterMark: highWaterMark,
    });

    this.highWaterMark = highWaterMark;
    this.flushAt = opts.flushAt || 128;
    this.flushEvery = opts.flushEvery || 5000;
    if (this.flushAt > this.highWaterMark) {
      throw new Error(
        "BatchExecStream flushAt parameter cannot be greater than highWaterMark"
      );
    }
    this.bulk = [];
    this.bulkCount = 0;
    this.bulkExec = opts.bulkExec;

    this.flushEveryTimeout = setInterval(
      () => this.flush(() => undefined),
      this.flushEvery
    );
    this.on("finish", () => {
      this.flush(() => {
        this.emit("close");
        clearTimeout(this.flushEveryTimeout);
      });
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
    return await new Promise((resolve) => this.once("close", resolve));
  }

  async nextDrain() {
    return await new Promise((resolve) => this.once("drain", resolve));
  }

  async writeAndWait(chunk: T) {
    if (!this.write(chunk)) {
      await this.nextDrain();
    }
  }

  private async flush(callback: () => void) {
    if (!this.bulkCount) {
      callback();
      return;
    }
    const bulk = this.bulk;
    this.bulk = [];
    this.bulkCount = 0;
    try {
      await this.bulkExec(bulk);
      callback();
    } catch (error) {
      logger.error({
        msg: "An error raised while executing bulk flush",
        err: error,
      });
      this.bulk.push(...bulk);
      this.bulkCount += bulk.length;
      callback();
      return;
    }
  }
}
