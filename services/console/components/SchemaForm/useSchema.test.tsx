import useSchema from './useSchema';
import renderer from 'react-test-renderer';
import { workspaceContext } from '../../providers/Workspace';
import workspaceContextValue from '../../providers/Workspace/workspaceContextValue.mock';

jest.mock('../../utils/urls', () => ({
  generatePageUrl: jest.fn(
    (workspaceSlug, pageSlug) => `http://page/${pageSlug}`
  ),
}));

it('should fail to build a select from config with empty store', () => {
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema();
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(
    <workspaceContext.Provider value={{ workspace: {} } as any}>
      <C />
    </workspaceContext.Provider>
  );
  expect(
    extractSelectOptionsFn({
      type: 'string',
      'ui:widget': 'select',
      'ui:options': {
        from: 'config',
      },
    })
  ).toBeNull();
});

it('should fail to build a select from config without path', () => {
  const config = {
    foo: {
      bar: {
        a: 1,
        b: 2,
        c: 3,
      },
    },
  };
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ config });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(
    <workspaceContext.Provider value={{ workspace: {} } as any}>
      <C />
    </workspaceContext.Provider>
  );
  expect(
    extractSelectOptionsFn({
      type: 'string',
      'ui:widget': 'select',
      'ui:options': {
        from: 'config',
      },
    })
  ).toBeNull();
});

it('should build a select from config', () => {
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema();
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  const workspace = {
    id: '42',
    name: 'Foo',
    config: {
      value: {
        foo: {
          bar: {
            a: 1,
            b: 2,
            c: 3,
          },
        },
      },
    },
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );
  expect(
    extractSelectOptionsFn({
      type: 'string',
      'ui:widget': 'select',
      'ui:options': {
        from: 'config',
        path: 'foo.bar[*]~',
      },
    })
  ).toEqual([
    { label: '', value: '' },
    {
      label: 'a',
      value: 'a',
    },
    {
      label: 'b',
      value: 'b',
    },
    {
      label: 'c',
      value: 'c',
    },
  ]);
});

it('should build a select from pageSections', () => {
  const pageSections = ['foo', 'bar'];
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ pageSections });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(
    <workspaceContext.Provider value={{ workspace: {} } as any}>
      <C />
    </workspaceContext.Provider>
  );
  expect(
    extractSelectOptionsFn({
      type: 'string',
      'ui:widget': 'select',
      'ui:options': {
        from: 'pageSections',
      },
    })
  ).toEqual([
    { label: '', value: '' },
    {
      label: 'foo',
      value: 'foo',
    },
    {
      label: 'bar',
      value: 'bar',
    },
  ]);
});

it('should build a select from automations', () => {
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema();
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  const workspace = {
    id: '42',
    name: 'Foo',
    automations: {
      foo: {
        name: 'Foo',
      },
      bar: {
        name: 'Bar',
        description: 'Bar automation',
        slug: 'do-bar',
      },
    },
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );
  const options = extractSelectOptionsFn({
    type: 'string',
    'ui:widget': 'select',
    'ui:options': {
      from: 'automations',
    },
  });
  expect(options).toEqual([
    { label: '', value: '' },
    {
      label: expect.any(Object),
      value: 'foo',
    },
    {
      label: expect.any(Object),
      value: 'do-bar',
    },
  ]);
  const labels = renderer.create(
    options.map(({ label }: any, k: number) => <div key={k}>{label}</div>)
  );
  expect(labels).toMatchSnapshot();
});

it('should build a select from endpoint automations ', () => {
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema();
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  const workspace = {
    id: '42',
    name: 'Foo',
    automations: {
      foo: {
        name: 'Foo',
      },
      bar: {
        name: 'Bar',
        description: 'Bar automation',
        slug: 'do-bar',
        when: {
          endpoint: true,
        },
      },
    },
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );
  const options = extractSelectOptionsFn({
    type: 'string',
    'ui:widget': 'select',
    'ui:options': {
      from: 'automations',
      filter: 'endpoint',
    },
  });

  expect(options).toEqual([
    { label: '', value: '' },
    {
      label: expect.any(Object),
      value: 'do-bar',
    },
  ]);
  const labels = renderer.create(
    options.map(({ label }: any, k: number) => <div key={k}>{label}</div>)
  );
  expect(labels).toMatchSnapshot();
});

it('should build a select from pages', () => {
  const pages = {
    'do-bar': {
      id: '456',
      name: 'Bar',
      description: 'Bar automation',
    },
  };
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ pages });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(
    <workspaceContext.Provider
      value={
        {
          workspace: {
            pages,
          },
        } as any
      }
    >
      <C />
    </workspaceContext.Provider>
  );
  const options = extractSelectOptionsFn({
    type: 'string',
    'ui:widget': 'select',
    'ui:options': {
      from: 'pages',
    },
  });
  expect(options).toEqual([
    { label: '', value: '' },
    {
      label: expect.any(Object),
      value: 'http://page/do-bar',
    },
  ]);
  const labels = renderer.create(
    options.map(({ label }: any, k: number) => <div key={k}>{label}</div>)
  );
  expect(labels).toMatchSnapshot();
});

it('should autocomplete events with no value', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const workspace = {};
  const apps = [{}];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  renderer.create(
    <workspaceContext.Provider value={{ workspace: {} } as any}>
      <C />
    </workspaceContext.Provider>
  );

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:emit',
      },
    })
  ).toEqual([]);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:listen',
      },
    })
  ).toEqual([]);
});

it('should get emit events', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const apps = [{}];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  const workspace = {
    id: '43',
    name: 'Foo',
    automations: {
      afoo: {
        name: 'foo',
        do: [],
        events: {
          emit: ['e1', 'e2'],
          listen: ['l1', 'l2'],
        },
      },
      abar: {
        name: 'bar',
        do: [],
        events: {
          listen: ['l3'],
        },
      },
    },
    pages: {
      pfoo: {
        name: 'foo',
        events: {},
      },
      pbar: {
        name: 'bar',
        do: [],
        events: {
          emit: ['e3'],
          listen: ['l4'],
        },
      },
    },
    imports: {
      ifoo: {
        name: 'foo',
        appSlug: 'foo',
        slug: 'foo',
        automations: [],
        blocks: [],
        events: {
          listen: ['l5'],
        },
      },
      ibar: {
        name: 'bar',
        appSlug: 'bar',
        slug: 'bar',
        automations: [],
        blocks: [],
        do: [],
        events: {
          emit: ['e4'],
          listen: ['l6'],
        },
      },
    },
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:emit',
      },
    })
  ).toEqual([
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e1',
          value: 'e1',
        },
        {
          label: 'e2',
          value: 'e2',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e3',
          value: 'e3',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e4',
          value: 'e4',
        },
      ],
    },
  ]);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:listen',
      },
    })
  ).toEqual([
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l1',
          value: 'l1',
        },
        {
          label: 'l2',
          value: 'l2',
        },
        {
          label: 'l3',
          value: 'l3',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l4',
          value: 'l4',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l5',
          value: 'l5',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l6',
          value: 'l6',
        },
      ],
    },
  ]);
});

it('should not have duplicate events', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const apps = [{}];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  const workspace = {
    id: '43',
    name: 'Foo',
    automations: {
      afoo: {
        name: 'foo',
        do: [],
        events: {
          emit: ['e1', 'e2'],
          listen: ['l1', 'l2'],
        },
      },
      abar: {
        name: 'bar',
        do: [],
        events: {
          emit: ['e1', 'e2'],
          listen: ['l1', 'l2'],
        },
      },
    },
    pages: {
      pfoo: {
        name: 'foo',
        events: {
          emit: ['e3'],
          listen: ['l4'],
        },
      },
      pbar: {
        name: 'bar',
        do: [],
        events: {
          emit: ['e3'],
          listen: ['l4'],
        },
      },
    },
    imports: {
      ifoo: {
        name: 'foo',
        appSlug: 'foo',
        slug: 'foo',
        automations: [],
        blocks: [],
        events: {
          listen: ['l5'],
        },
      },
      ibar: {
        name: 'bar',
        appSlug: 'bar',
        slug: 'bar',
        automations: [],
        blocks: [],
        do: [],
        events: {
          emit: ['e4'],
          listen: ['l6'],
        },
      },
    },
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:emit',
      },
    })
  ).toEqual([
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e1',
          value: 'e1',
        },
        {
          label: 'e2',
          value: 'e2',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e3',
          value: 'e3',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'e4',
          value: 'e4',
        },
      ],
    },
  ]);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:listen',
      },
    })
  ).toEqual([
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l1',
          value: 'l1',
        },
        {
          label: 'l2',
          value: 'l2',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l4',
          value: 'l4',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l5',
          value: 'l5',
        },
      ],
    },
    {
      label: 'events.autocomplete.label',
      options: [
        {
          label: 'l6',
          value: 'l6',
        },
      ],
    },
  ]);
});
