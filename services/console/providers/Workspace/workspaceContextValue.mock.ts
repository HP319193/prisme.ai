import { Events } from '../../utils/api';
import { WorkspaceContext } from './WorkspaceProvider';

export const workspaceContextValue: WorkspaceContext = {
  workspace: {
    id: '42',
    name: 'Foo',
    imports: {
      app: {
        appSlug: 'my-app',
        automations: [],
        blocks: [],
        events: {},
        slug: 'my-app',
      },
    },
  },
  createAutomation: jest.fn(),
  creatingAutomation: false,
  createPage: jest.fn(),
  creatingPage: false,
  createBlock: jest.fn(),
  creatingBlock: false,
  deleteWorkspace: jest.fn(),
  fetchWorkspace: jest.fn(),
  installApp: jest.fn(),
  loading: false,
  saveWorkspace: jest.fn((w: any) => w),
  saving: false,
  events: {
    on: jest.fn(),
    all: jest.fn(),
    destroy: jest.fn(),
  } as unknown as Events,
};

export default workspaceContextValue;
