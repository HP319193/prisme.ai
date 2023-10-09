import { Schema } from '@prisme.ai/design-system';
import { get } from 'lodash';
import { extendsSchema } from './extendsSchema';

it('should extends Schema', async () => {
  async function getSchema(slug: string) {
    switch (slug) {
      case 'Some Block':
        return {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
            },
          },
        } as Schema;
    }
    return undefined;
  }
  expect(
    await extendsSchema(
      {
        type: 'object',
        properties: {
          foo: {
            extends: {
              block: 'Some Block',
            },
          },
        },
      },
      getSchema
    )
  ).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'object',
        properties: {
          bar: {
            type: 'string',
          },
        },
      },
    },
  });
});

it('should extends Schema with invalid slugs', async () => {
  async function getSchema(slug: string) {
    return undefined;
  }
  expect(
    await extendsSchema(
      {
        type: 'object',
        properties: {
          foo: {
            extends: {
              block: 'Some Block',
            },
          },
        },
      },
      getSchema
    )
  ).toEqual({
    type: 'object',
    properties: {
      foo: {},
    },
  });
});

it('should extends nested Schema', async () => {
  async function getSchema(slug: string) {
    switch (slug) {
      case 'Some Nested Block':
        return {
          bar: {
            type: 'string',
          },
        } as Schema;
      case 'Some Block':
        return {
          type: 'object',
          properties: {
            extends: {
              block: 'Some Nested Block',
            },
          },
        } as Schema;
    }
    return undefined;
  }
  expect(
    await extendsSchema(
      {
        type: 'object',
        properties: {
          foo: {
            extends: {
              block: 'Some Block',
            },
          },
        },
      },
      getSchema
    )
  ).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'object',
        properties: {
          bar: {
            type: 'string',
          },
        },
      },
    },
  });
});

it('should extends Schema with path', async () => {
  async function getSchema(slug: string, path: string) {
    switch (slug) {
      case 'Some Block':
        const schema = {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
            },
          },
        } as Schema;
        return get(schema, path);
    }
    return undefined;
  }
  expect(
    await extendsSchema(
      {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
          extends: {
            block: 'Some Block',
            path: 'properties',
          },
        },
      },
      getSchema
    )
  ).toEqual({
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'string',
      },
    },
  });
});
