import useSchema from './useSchema';
import renderer from 'react-test-renderer';

it('should fail to build a select from config with empty store', () => {
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema();
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(<C />);
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
  renderer.create(<C />);
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
  renderer.create(<C />);
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
  renderer.create(<C />);
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
  const automations = {
    foo: {
      name: 'Foo',
    },
    bar: {
      name: 'Bar',
      description: 'Bar automation',
      slug: 'do-bar',
    },
  };
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ automations });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(<C />);
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
  // @ts-ignore
  const labels = renderer.create(options.map(({ label }: any) => label));
  expect(labels).toMatchSnapshot();
});

it('should build a select from endpoint automations ', () => {
  const automations = {
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
  };
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ automations });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(<C />);
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
  // @ts-ignore
  const labels = renderer.create(options.map(({ label }: any) => label));
  expect(labels).toMatchSnapshot();
});

it('should build a select from pages', () => {
  const pages = new Set([
    {
      id: '123',
      name: 'Foo',
    },
    {
      id: '456',
      name: 'Bar',
      description: 'Bar automation',
      slug: 'do-bar',
    },
  ]);
  let extractSelectOptionsFn: Function = () => null;
  const C = () => {
    const { extractSelectOptions } = useSchema({ pages });
    extractSelectOptionsFn = extractSelectOptions;
    return null;
  };
  renderer.create(<C />);
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
      value: '123',
    },
    {
      label: expect.any(Object),
      value: '456',
    },
  ]);
  // @ts-ignore
  const labels = renderer.create(options.map(({ label }: any) => label));
  expect(labels).toMatchSnapshot();
});

it('should autocomplete emit events', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const workspace = {
    name: 'workspace',
    imports: {
      'App A': {
        appSlug: 'App A',
        appName: 'App A',
        config: {
          items: {
            foo: {},
            bar: {},
          },
        },
      },
    },
    automations: {
      foo: {
        when: {
          events: ['listen A', 'listen B'],
        },
        do: [
          {
            emit: {
              event: 'emit A',
            },
          },
          {
            wait: {
              timeout: 42,
            },
          },
          {
            emit: {
              event: 'emit B',
            },
          },
        ],
      },
      bar: {
        when: {
          events: ['listen C'],
        },
      },
      empty: {
        do: [
          {
            emit: {
              event: 'emit C',
            },
          },
        ],
      },
    },
  };
  const apps = [
    {
      appName: 'App A',
      slug: 'App A',
      events: {
        emit: [
          {
            event: 'App A emit A',
          },
          {
            event: 'App A emit B {{foo}}',
            source: {
              foo: {
                from: 'appConfig',
                path: 'items[*]~',
              },
            },
          },
        ],
        listen: ['App A listen A'],
      },
    },
    {
      appName: 'App B',
      slug: 'App B',
      events: {
        emit: [
          {
            event: 'App B emit A',
          },
        ],
        listen: ['App B listen A', 'App B listen B'],
      },
    },
  ];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  renderer.create(<C />);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:emit',
      },
    })
  ).toEqual([
    {
      label: 'workspace',
      options: [
        {
          label: 'emit A',
          value: 'emit A',
        },
        {
          label: 'emit B',
          value: 'emit B',
        },
        {
          label: 'emit C',
          value: 'emit C',
        },
      ],
    },
    {
      label: 'App A',
      options: [
        {
          label: 'App A emit A',
          value: 'App A.App A emit A',
        },
        {
          label: 'App A emit B foo',
          value: 'App A.App A emit B foo',
        },
        {
          label: 'App A emit B bar',
          value: 'App A.App A emit B bar',
        },
      ],
    },
    {
      label: 'App B',
      options: [
        {
          label: 'App B emit A',
          value: 'App B.App B emit A',
        },
      ],
    },
  ]);
});

it('should autocomplete emit events', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const workspace = {
    name: 'workspace',
    imports: {
      'App A': {
        appSlug: 'App A',
        appName: 'App A',
        config: {
          items: {
            foo: {},
            bar: {},
          },
        },
      },
    },
    automations: {
      foo: {
        when: {
          events: ['listen A', 'listen B'],
        },
        do: [
          {
            emit: {
              event: 'emit A',
            },
          },
          {
            wait: {
              timeout: 42,
            },
          },
          {
            emit: {
              event: 'emit B',
            },
          },
        ],
      },
      bar: {
        when: {
          events: ['listen C'],
        },
      },
      empty: {
        do: [
          {
            emit: {
              event: 'emit C',
            },
          },
        ],
      },
    },
  };
  const apps = [
    {
      appName: 'App A',
      slug: 'App A',
      events: {
        emit: [
          {
            event: 'App A emit A',
          },
          {
            event: 'App A emit B {{foo}}',
            source: {
              foo: {
                from: 'appConfig',
                path: 'items[*]~',
              },
            },
          },
        ],
        listen: ['App A listen A'],
      },
    },
    {
      appName: 'App B',
      slug: 'App B',
      events: {
        emit: [
          {
            event: 'App B emit A',
          },
        ],
        listen: ['App B listen A', 'App B listen B'],
      },
    },
  ];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  renderer.create(<C />);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:listen',
      },
    })
  ).toEqual([
    {
      label: 'workspace',
      options: [
        {
          label: 'listen A',
          value: 'listen A',
        },
        {
          label: 'listen B',
          value: 'listen B',
        },
        {
          label: 'listen C',
          value: 'listen C',
        },
      ],
    },
    {
      label: 'App A',
      options: [
        {
          label: 'App A listen A',
          value: 'App A listen A',
        },
      ],
    },
    {
      label: 'App B',
      options: [
        {
          label: 'App B listen A',
          value: 'App B listen A',
        },
        {
          label: 'App B listen B',
          value: 'App B listen B',
        },
      ],
    },
  ]);
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
  renderer.create(<C />);

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

it('should autocomplete nested emit events', () => {
  let extractAutocompleteOptionsFn: Function = () => null;
  const workspace = {
    name: 'workspace',
    automations: {
      foo: {
        do: [
          {
            emit: {
              event: 'level 1',
            },
          },
          {
            conditions: {
              bar: [
                {
                  emit: {
                    event: 'level 2',
                  },
                },
              ],
              default: [
                {
                  conditions: {
                    bar: [
                      {
                        emit: {
                          event: 'level 3',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      bar: {
        do: [
          {
            all: [
              {
                emit: {
                  event: 'all 1',
                },
              },
              {
                emit: {
                  event: 'all 2',
                },
              },
            ],
          },
        ],
      },
      doo: {
        do: [
          {
            repeat: {
              on: 'boo',
              do: [
                {
                  emit: {
                    event: 'repeat 1',
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const apps = [{}];
  const C = () => {
    const { extractAutocompleteOptions } = useSchema({
      workspace,
      apps,
    });
    extractAutocompleteOptionsFn = extractAutocompleteOptions;
    return null;
  };
  renderer.create(<C />);

  expect(
    extractAutocompleteOptionsFn({
      'ui:options': {
        autocomplete: 'events:emit',
      },
    })
  ).toEqual([
    {
      label: 'workspace',
      options: [
        {
          label: 'level 1',
          value: 'level 1',
        },
        {
          label: 'level 2',
          value: 'level 2',
        },
        {
          label: 'level 3',
          value: 'level 3',
        },
        {
          label: 'all 1',
          value: 'all 1',
        },
        {
          label: 'all 2',
          value: 'all 2',
        },
        {
          label: 'repeat 1',
          value: 'repeat 1',
        },
      ],
    },
  ]);
});
