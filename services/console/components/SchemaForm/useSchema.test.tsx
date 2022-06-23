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
