import { executeAutomation } from './automations';
jest.mock('./automations', () => ({
  __esModule: true, // this property makes it work
  executeAutomation: jest.fn(),
}));

import Runtime from '.';
import { Broker } from '@prisme.ai/broker/lib/__mocks__';
import { EventSource } from '@prisme.ai/broker';
import { Workspaces } from '../workspaces';
import { DriverType } from '../../storage/types';
import { FilesystemOptions } from '../../storage/drivers/filesystem';
import path from 'path';
import { Apps } from '../apps';
import Cache from '../../cache/__mocks__/cache';
import { AvailableModels } from '../workspaces/__mocks__/workspaces';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../config';

global.console.warn = jest.fn();

const sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

let brokers = [];

const getMocks = (
  partialSource: Partial<EventSource>,
  forceTopic: string = RUNTIME_EMITS_BROKER_TOPIC
) => {
  const parentBroker = new Broker();
  const broker = parentBroker.child(partialSource, {
    forceTopic,
    validateEvents: false,
  });

  const modelsStorage: FilesystemOptions = {
    dirpath: path.join(__dirname, '../workspaces/__mocks__/'),
  };

  const apps = new Apps(DriverType.FILESYSTEM, modelsStorage);
  const workspaces = new Workspaces(
    DriverType.FILESYSTEM,
    modelsStorage,
    apps,
    broker as any
  );
  const runtime = new Runtime(broker as any, workspaces, new Cache());

  brokers.push(broker);
  return { broker, runtime };
};

describe('Simple events processing', () => {
  it('Basic', async () => {
    const { broker, runtime } = getMocks({
      workspaceId: AvailableModels.Basic,
      userId: 'unitTest',
    });
    broker.start();
    runtime.start();

    broker.send('run.empty', {});
    await sleep(100);

    expect(executeAutomation).toBeCalled();
  });
});

afterAll(async () => {
  brokers.forEach((broker) => broker.close());
});
