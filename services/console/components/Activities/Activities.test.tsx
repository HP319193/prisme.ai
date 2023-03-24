import renderer, { act } from 'react-test-renderer';
import Activities from './Activities';
import { workspaceContext } from '../../providers/Workspace';
import { eventsContext } from '../../providers/Events';
import { queryStringContext } from '../../providers/QueryStringProvider';
import workspaceContextValue from '../../providers/Workspace/workspaceContextValue.mock';
import eventsContextValue from '../../providers/Events/eventsContextValue.mock';
import queryStringContextValue from '../../providers/QueryStringProvider/queryStringContextValue.mock';

jest.useFakeTimers();

jest.mock('../../utils/useYaml', () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

jest.mock('../../layouts/WorkspaceLayout/context', () => {
  const mock = {
    createAutomation: jest.fn(),
    createPage: jest.fn(),
    installApp: jest.fn(),
  };
  return {
    useWorkspaceLayout: () => mock,
  };
});

it('should render virgin workspace', () => {
  const root = renderer.create(
    <queryStringContext.Provider value={queryStringContextValue}>
      <workspaceContext.Provider value={workspaceContextValue}>
        <eventsContext.Provider
          value={{ ...eventsContextValue, isVirgin: true, loading: false }}
        >
          <Activities />
        </eventsContext.Provider>
      </workspaceContext.Provider>
    </queryStringContext.Provider>
  );

  expect(root.toJSON()).toMatchSnapshot();
});

it('should render some events', () => {
  const root = renderer.create(
    <queryStringContext.Provider value={queryStringContextValue}>
      <workspaceContext.Provider value={workspaceContextValue}>
        <eventsContext.Provider
          value={{
            ...eventsContextValue,
            events: new Set([
              {
                id: '4',
                type: 'event a',
                createdAt: new Date('2022-01-02T08:02'),
                source: {
                  host: {
                    service: 'osef',
                  },
                  correlationId: 'osef',
                },
                size: 0,
              },
              {
                id: '3',
                type: 'event c',
                createdAt: new Date('2022-01-01T10:01'),
                source: {
                  host: {
                    service: 'osef',
                  },
                  correlationId: 'osef',
                },
                size: 0,
              },
              {
                id: '2',
                type: 'event b',
                createdAt: new Date('2022-01-01T10:00'),
                source: {
                  host: {
                    service: 'osef',
                  },
                  correlationId: 'osef',
                },
                size: 0,
              },
              {
                id: '1',
                type: 'event a',
                createdAt: new Date('2022-01-01T00:00'),
                source: {
                  host: {
                    service: 'osef',
                  },
                  correlationId: 'osef',
                },
                size: 0,
              },
            ]),
          }}
        >
          <Activities />
        </eventsContext.Provider>
      </workspaceContext.Provider>
    </queryStringContext.Provider>
  );

  expect(root.toJSON()).toMatchSnapshot();
});

it('should render no result', () => {
  const root = renderer.create(
    <queryStringContext.Provider value={queryStringContextValue}>
      <workspaceContext.Provider value={workspaceContextValue}>
        <eventsContext.Provider
          value={{
            ...eventsContextValue,
            events: new Set(),
          }}
        >
          <Activities />
        </eventsContext.Provider>
      </workspaceContext.Provider>
    </queryStringContext.Provider>
  );

  expect(root.toJSON()).toMatchSnapshot();
});

it('should update query string', () => {
  const root = renderer.create(
    <queryStringContext.Provider value={queryStringContextValue}>
      <workspaceContext.Provider value={workspaceContextValue}>
        <eventsContext.Provider value={eventsContextValue}>
          <Activities />
        </eventsContext.Provider>
      </workspaceContext.Provider>
    </queryStringContext.Provider>
  );
  const headerEl = root.root.find((item) => {
    return !!item.props.Header;
  });
  const onChange =
    headerEl.props.Header.props.children[0].props.title.props.children[1].props
      .children.props.onChange;
  act(() => {
    onChange({ target: { value: 'foo' } });
  });
  const setQueryString = queryStringContextValue.setQueryString as jest.Mock;
  expect(setQueryString).toHaveBeenCalled();
  expect(setQueryString.mock.calls[0][0](new URLSearchParams())).toEqual(
    new URLSearchParams({ text: 'foo' })
  );
  setQueryString.mockClear();

  act(() => {
    onChange({ target: { value: '' } });
  });
  expect(setQueryString).toHaveBeenCalled();
  expect(setQueryString.mock.calls[0][0](new URLSearchParams())).toEqual(
    new URLSearchParams()
  );
});
