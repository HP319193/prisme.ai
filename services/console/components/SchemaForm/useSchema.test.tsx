import useSchema from './useSchema';
import renderer from 'react-test-renderer';
import { Schema } from '@prisme.ai/design-system';

jest.mock('../../layouts/WorkspaceLayout', () => {
  const mock = {
    workspace: {
      id: '42',
      automations: {
        foo: {
          slug: 'foofoo',
          name: 'Foo',
          description: 'Some foo',
          when: {
            endpoint: true,
          },
        },
        bar: {},
      },
    },
  };
  return {
    useWorkspace: () => mock,
  };
});

jest.mock('../PagesProvider/context', () => {
  const mock = {
    pages: new Map([
      [
        '42',
        new Set([
          {
            id: '1',
            slug: 'page-1',
            name: 'Page Un',
            description: 'La première page',
          },
          {
            id: '2',
          },
          {
            id: '3',
            slug: 'page-3',
            name: 'Page trois',
          },
        ]),
      ],
    ]),
  };
  return () => mock;
});

it('should select:automations', () => {
  let makeSchemaFn: Function = () => null;
  const C = () => {
    const { makeSchema } = useSchema();
    makeSchemaFn = makeSchema;
    return null;
  };
  renderer.create(<C />);
  const res = makeSchemaFn({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select:automations',
      },
    },
  });
  expect(res).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select',
        'ui:options': {
          select: {
            options: [
              {
                label: expect.any(Object),
                value: 'foofoo',
              },
              {
                label: expect.any(Object),
                value: 'bar',
              },
            ],
          },
        },
      },
    },
  });

  // @ts-ignore
  const labels = renderer.create(
    res.properties.foo['ui:options'].select.options.map(
      ({ label }: any) => label
    )
  );
  expect(labels).toMatchSnapshot();
});

it('should select:endpoints', () => {
  let makeSchemaFn: Function = () => null;
  const C = () => {
    const { makeSchema } = useSchema();
    makeSchemaFn = makeSchema;
    return null;
  };
  renderer.create(<C />);
  const res = makeSchemaFn({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select:endpoints',
      },
    },
  });
  expect(res).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select',
        'ui:options': {
          select: {
            options: [
              {
                label: expect.any(Object),
                value: 'foofoo',
              },
            ],
          },
        },
      },
    },
  });

  // @ts-ignore
  const labels = renderer.create(
    res.properties.foo['ui:options'].select.options.map(
      ({ label }: any) => label
    )
  );
  expect(labels).toMatchSnapshot();
});

it('should select:pages', () => {
  let makeSchemaFn: Function = () => null;
  const C = () => {
    const { makeSchema } = useSchema();
    makeSchemaFn = makeSchema;
    return null;
  };
  renderer.create(<C />);
  const res = makeSchemaFn({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select:pages',
      },
    },
  });
  expect(res).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        'ui:widget': 'select',
        'ui:options': {
          select: {
            options: [
              {
                label: expect.any(Object),
                value: '1',
              },
              {
                label: expect.any(Object),
                value: '2',
              },
              {
                label: expect.any(Object),
                value: '3',
              },
            ],
          },
        },
      },
    },
  });

  // @ts-ignore
  const labels = renderer.create(
    res.properties.foo['ui:options'].select.options.map(
      ({ label }: any) => label
    )
  );
  expect(labels).toMatchSnapshot();
});

it('should use custom sources', () => {
  let makeSchemaFn: Function = () => null;
  let expected: any;
  const C = () => {
    const { makeSchema } = useSchema();
    makeSchemaFn = makeSchema;
    return null;
  };
  renderer.create(<C />);
  const res = makeSchemaFn(
    {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          'ui:widget': 'select:something',
        },
      },
    },
    {
      'select:something': (schema: Schema) => {
        expected = schema;
        schema.title = 'CHANGED';
        return schema;
      },
    }
  );
  expect(expected).toEqual({
    title: 'CHANGED',
    type: 'string',
    'ui:widget': 'select:something',
  });
});
