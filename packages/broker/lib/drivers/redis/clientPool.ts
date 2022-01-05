import { createClient } from "@node-redis/client";
import { RedisClientType } from "@node-redis/client/dist/lib/client";
import { StreamsMessagesReply } from "@node-redis/client/dist/lib/commands/generic-transformers";
import { SubscriptionOptions, DriverOptions } from "..";

const NoGroupErrRegexp = new RegExp(/No such key '([a-zA-Z0-9_\-.:]+)'/);
const MAX_CLIENTS = 10;
const BLOCKING_TIME = 200;

interface ClientInfo {
  client: RedisClientType;
  blocking: boolean;
  ready: boolean;
  available: boolean;
}

interface XPendingReply {
  pending: number;
  firstId: string | null;
  lastId: number | null;
  consumers: Array<string> | null;
}

export type StreamName = string;
export type RedisMessage = { id: string } & Record<string, any>;
export type DeserializedMessages = Record<StreamName, RedisMessage[]>;

/*
 * Abstract redis commands execution
 * Execute xread & xreadgroup commands in BLOCK mode whenever possible to reduce output traffic
 * To do so, it dispatch xread & xreadgroup to a pool of MAX_CLIENTS clients.
 */
/*
 * Please note that current implemenation does not handle switching between blocking clients for a dynamically growing list of stream names as once initialized, clients stay assigned to the first said streams
 * Once MAX_CLIENTS has been reached & new stream names are coming in, they will all be processed with the shared nonblocking client
 */
export class ClientPool {
  private opts: DriverOptions;
  private clients: ClientInfo[];
  public ready: Promise<any>;
  private clientsByStreams: Record<string, ClientInfo>;
  private nonblocking: ClientInfo;

  private createdGrouppedStreams: Set<string>;

  constructor(opts: DriverOptions) {
    this.opts = opts;
    this.clients = [];
    this.clientsByStreams = {};
    this.nonblocking = this.createClient(opts, false);
    this.ready = this.nonblocking.client.connect().then(() => {
      this.nonblocking.ready = true;
      return true;
    });

    this.createdGrouppedStreams = new Set();
  }

  private getClient(streams: string[]) {
    const key = streams.join("_");
    // Multiple callers can use the same blocking client if they are listening to the same streams
    if (key && key in this.clientsByStreams) {
      return this.clientsByStreams[key];
    }

    if (Object.keys(this.clients).length >= MAX_CLIENTS) {
      return this.nonblocking;
    }

    // Create another client
    const clientInfo = this.createClient(this.opts, true);
    this.clients.push(clientInfo);
    if (streams) {
      this.clientsByStreams[key] = clientInfo;
    }
    return clientInfo;
  }

  private createClient(opts: DriverOptions, blocking: boolean) {
    const client = createClient({
      url: opts.host,
      password: opts.password,
    });
    client.on("error", (err: Error) => {
      console.error(`Error occured with broker redis driver : ${err}`);
    });
    const clientInfo = {
      blocking,
      client,
      ready: false,
      available: true,
    };
    this.clients.push(clientInfo);
    return clientInfo;
  }

  async closeClients() {
    await Promise.all(
      this.clients.map(({ client }) => client.quit().catch(() => {}))
    );
  }

  // Execute a redis command with a client available for BLOCK mode whenever possible
  private async execute<T>(
    command: (client: RedisClientType, blocking: boolean) => T,
    targetStreams: string[]
  ) {
    const client = this.getClient(targetStreams);
    if (!client.ready) {
      client.ready = await client.client.connect().then(() => true);
    }
    return await command(client.client, client.blocking);
  }

  async send(message: any, stream: string) {
    return this.nonblocking.client
      .xAdd(stream, "*", {
        value: JSON.stringify(message),
      })
      .then((createdId: string) => {
        if (typeof createdId !== "string") {
          throw createdId;
        }
        return { ...message, id: createdId };
      });
  }

  async readStreams(streams: string[], lastKnownIds?: string[]) {
    const reply = await this.execute(
      (client, blocking) =>
        client.xRead(
          streams.map((streamName, idx) => ({
            key: streamName,
            id: lastKnownIds?.[idx] || `${Date.now()}-0`,
          })),
          {
            BLOCK: blocking ? BLOCKING_TIME : undefined,
          }
        ),
      streams
    );
    return this.deserializeStreamsReply(reply);
  }

  async readStreamsPartition(
    groupName: string,
    consumerId: string,
    subscriptionOpts: SubscriptionOptions,
    streams: string[]
  ): Promise<DeserializedMessages> {
    await Promise.all(
      streams.map((streamName) => this.createGroup(streamName, groupName))
    );
    return await this.execute(async (client, blocking) => {
      try {
        const reply = await client.xReadGroup(
          groupName,
          consumerId,
          streams.map((streamName) => ({
            key: streamName,
            id: ">",
          })),
          {
            NOACK: subscriptionOpts.NoAck ? true : undefined,
            BLOCK: blocking ? BLOCKING_TIME : undefined,
          }
        );
        return this.deserializeStreamsReply(reply);
      } catch (error) {
        if (`${error}`.includes("NOGROUP")) {
          const [, streamName] = `${error}`.match(NoGroupErrRegexp) || [,];
          if (streamName) {
            this.createdGrouppedStreams.delete(streamName);
            return this.readStreamsPartition(
              groupName,
              consumerId,
              subscriptionOpts,
              streams
            );
          }
        }
        throw error;
      }
    }, streams);
  }

  async createGroup(stream: string, group: string) {
    if (this.createdGrouppedStreams.has(stream)) {
      return Promise.resolve(true);
    }

    try {
      const ret = await this.nonblocking.client.xGroupCreate(
        stream,
        group,
        "$",
        {
          MKSTREAM: true,
        }
      );
      if (ret !== "OK") {
        throw ret;
      }
    } catch (error: any) {
      if (
        !error?.message?.includes ||
        !error.message.includes("already exists")
      ) {
        console.error(`Redis broker could not create group : `, error);
        throw error;
      }
    }
    this.createdGrouppedStreams.add(stream);
    return true;
  }

  private deserializeStreamsReply(
    reply: StreamsMessagesReply
  ): DeserializedMessages {
    if (reply === null) {
      return {};
    }
    if (!reply || !reply.map) {
      throw new Error(
        `Redis broker could not deserialize invalid streams messages reply : ${reply}`
      );
    }
    return reply.reduce((streams, { name, messages }) => {
      return {
        ...streams,
        [name]: messages
          .map(({ id, message: raw }) => {
            try {
              const message = JSON.parse(raw.value);
              return {
                id,
                ...message,
              };
            } catch (error) {
              console.error(
                "Redis broker could not parse following message : ",
                raw
              );
            }
          })
          .filter(Boolean),
      };
    }, {});
  }

  async acknowledgeMessage(stream: string, group: string, messageId: string) {
    return this.nonblocking.client
      .xAck(stream, group, messageId)
      .then((ret: number) => ret == 1);
  }

  async pendingMessages(stream: string, group: string): Promise<XPendingReply> {
    return this.nonblocking.client.xPending(stream, group);
  }
}
