import Workspaces from './Workspaces';
import renderer, { act } from 'react-test-renderer';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useRouter } from 'next/router';
import CardButton from '../components/Workspaces/CardButton';

jest.mock('../components/WorkspacesProvider', () => {
  const workspaces = new Map();
  const create = jest.fn(() => ({
    id: '43',
  }));

  return {
    useWorkspaces: () => ({
      workspaces,
      create,
    }),
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

beforeEach(() => {
  useWorkspaces().workspaces.clear();
});

it('should render empty', () => {
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render some workspaces', () => {
  useWorkspaces().workspaces.set('1', {
    id: '1',
    name: 'foo',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });
  useWorkspaces().workspaces.set('42', {
    id: '42',
    name: 'bar',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should create new workspace', async () => {
  const root = renderer.create(<Workspaces />);
  await act(async () => {
    const createButton = root.root.find((a) => {
      return a.props?.children?.[1]?.props?.children === 'create.label';
    });
    await createButton.props.onClick();
  });
  expect(useWorkspaces().create).toHaveBeenCalledWith('create.defaultName');
  expect(useRouter().push).toHaveBeenCalledWith('/workspaces/43');
});
