import Workspaces from './Workspaces';
import renderer, { act } from 'react-test-renderer';
import { useWorkspaces } from '../providers/Workspaces';
import { useRouter } from 'next/router';
import { Workspace } from '../utils/api';

jest.mock('../providers/Workspaces', () => {
  const workspaces: Workspace[] = [];
  const createWorkspace = jest.fn(() => ({
    id: '43',
  }));
  const loading = new Map();
  const LoadingType = {
    New: 'New',
    List: 'List',
  };

  const fetchWorkspaces = jest.fn();

  return {
    useWorkspaces: () => ({
      workspaces,
      createWorkspace,
      loading,
      fetchWorkspaces,
    }),
    LoadingType,
  };
});
jest.mock('next/router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({
      push,
    }),
  };
});
jest.mock('next/image', () => {
  const Image = ({ src }: any) => <div />;

  return Image;
});
jest.mock('../components/UserProvider', () => {
  const user = {
    id: '123',
  };
  return {
    useUser: () => ({
      user,
    }),
  };
});

beforeEach(() => {
  useWorkspaces().workspaces = [];
});

it('should render empty', () => {
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render some workspaces', () => {
  useWorkspaces().workspaces = [
    {
      id: '1',
      name: 'foo',
      createdAt: new Date('2021-12-15'),
      createdBy: '123',
      updatedAt: new Date('2021-12-15'),
      updatedBy: '123',
    },
    {
      id: '42',
      name: 'bar',
      createdAt: new Date('2021-12-15'),
      createdBy: '123',
      updatedAt: new Date('2021-12-15'),
      updatedBy: '123',
    },
  ];
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});
