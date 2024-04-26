import { Broker, CallbackContext, EventCallback } from '@prisme.ai/broker';
import { Subscriptions } from './subscriptions';
import Cache from '../../cache/__mocks__/cache';

jest.mock('@prisme.ai/broker', () => ({
  Broker: function Broker() {
    this.all = () => {};
  },
}));

jest.setTimeout(5000);
const WorkspaceA = 'myFirstWorkspace';
const UserA = 'myFirstUser';

interface Chunk {
  type: string;
  id: string;
  workspaceId: string;
}

const sleep = async (min: number, max?: number) => {
  return new Promise((resolve) => {
    const delay = max ? Math.round(Math.random() * max) + min : min;
    setTimeout(resolve, delay);
  });
};

const generateChunks = (
  type: string | string[],
  min: number,
  max?: number
): Chunk[] => {
  const count = max ? Math.round(Math.random() * max) + min : min;
  return Array.apply(null, Array(count))
    .map(() => ({
      type: Array.isArray(type)
        ? type[Math.floor(Math.random() * type.length)]
        : type,
      id: `${Math.round(Math.random() * 10000000)}`,
      workspaceId: WorkspaceA,
    }))
    .sort(() => 0.5 - Math.random()); // shuffle
};

const getSubscriptions = (
  chunksGenerator: (cb: (event: Chunk) => void) => void
) => {
  class DummyAccessManager {
    permissions: any;

    constructor() {
      this.permissions = {
        updateRules: () => {},
        ability: {
          rules: [],
        },
        can: () => true,
      };
    }

    as() {
      return this;
    }

    pullRoleFromSubject() {}

    can() {
      return true;
    }
  }

  const subscriptions = new Subscriptions(
    {
      on: () => Promise.resolve(),
      send: (event) => Promise.resolve(event),
    } as any as Broker,
    new DummyAccessManager() as any,
    new Cache()
  );

  chunksGenerator((event) => {
    subscriptions.push({
      payload: event,
      id: event.id,
      type: event.type,
      createdAt: '',
      source: {
        workspaceId: event.workspaceId,
      },
    });
  });

  return subscriptions;
};

const verifyReceivedChunks = (receivedChunks: Chunk[], sentChunks: Chunk[]) => {
  expect(receivedChunks.length).toBe(sentChunks.length);
  expect(receivedChunks.map(({ id, type }) => `${type}-${id}`).sort()).toEqual(
    sentChunks.map(({ id, type }) => `${type}-${id}`).sort()
  );
};

describe('Basic', () => {
  it('Should receive all notified events', async () => {
    const willSend = generateChunks('myEventName', 10);
    const received: Chunk[] = [];

    let sentIdx = 0;
    const events = getSubscriptions(async (cb) => {
      for (sentIdx; sentIdx < willSend.length; sentIdx++) {
        cb(willSend[sentIdx]);
        await sleep(100);
      }
      return true;
    });

    // Subscribe before starting emitting events
    await events.subscribe(WorkspaceA, {
      workspaceId: WorkspaceA,
      userId: UserA,
      sessionId: 'mySessionId',
      socketId: 'mySocketId',
      filters: {},
      authData: {},
    });

    // Emit events
    events.start((subscriber, event) => {
      received.push(event.payload as any);
    });

    // Wait & see
    await sleep(1200);
    verifyReceivedChunks(received, willSend);
  });

  it('Should receive only events sent after subscription', async () => {
    const willSend = generateChunks('myEventName', 100);
    const received: Chunk[] = [];

    const subscribeAfter = 30; // Will subscribe to events after 30 events emits
    const shouldReceive = willSend.slice(subscribeAfter + 1);
    const sleepBetweenEmits = 20;
    let sentIdx = 0;

    const events = getSubscriptions(async (cb) => {
      for (sentIdx; sentIdx < willSend.length; sentIdx++) {
        cb(willSend[sentIdx]);
        await sleep(sleepBetweenEmits);

        if (sentIdx === subscribeAfter) {
          await events.subscribe(WorkspaceA, {
            workspaceId: WorkspaceA,
            userId: UserA,
            sessionId: 'mySessionId',
            socketId: 'mySocketId',
            filters: {},
            authData: {},
          });
        }
      }
      return true;
    });
    events.start((subscriber, event) => {
      received.push(event.payload as any);
    });

    // Wait & see
    await sleep(3000);
    verifyReceivedChunks(received, shouldReceive);
  });

  it('Should not receive events after unsubscription', async () => {
    const willSend = generateChunks('myEventName', 100);
    const received: Chunk[] = [];

    const subscribeAfter = 30; // Will subscribe to events after 30 events emits
    const unsubscribeAfter = 70;
    const shouldReceive = willSend.slice(
      subscribeAfter + 1,
      unsubscribeAfter + 1
    );
    const sleepBetweenEmits = 20;
    let sentIdx = 0;
    let unsubscribeCallback: () => void;
    const events = getSubscriptions(async (cb) => {
      for (sentIdx; sentIdx < willSend.length; sentIdx++) {
        cb(willSend[sentIdx]);
        await sleep(sleepBetweenEmits);

        if (sentIdx === subscribeAfter) {
          const subscription = await events.subscribe(WorkspaceA, {
            workspaceId: WorkspaceA,
            userId: UserA,
            sessionId: 'mySessionId',
            socketId: 'mySocketId',
            filters: {},
            authData: {},
          });
          unsubscribeCallback = subscription.unsubscribe;
        } else if (sentIdx === unsubscribeAfter) {
          unsubscribeCallback();
        }
      }
      return true;
    });
    events.start((subscriber, event) => {
      received.push(event.payload as any);
    });

    // Wait & see
    await sleep(3000);
    verifyReceivedChunks(received, shouldReceive);
  });
});
