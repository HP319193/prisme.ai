import { Schema } from '@prisme.ai/design-system';
import getFieldFromValuePath from './getFieldFromValuePath';

it('should get field from value path', () => {
  const schema: Schema = {
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
  };
  expect(getFieldFromValuePath(schema, 'foo.bar')).toEqual({
    type: 'string',
  });
});

// TODO
xit('should get field from value path with arrays', () => {
  const schema: Schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        bar: {
          type: 'string',
        },
      },
    },
  };
  expect(getFieldFromValuePath(schema, '[0].bar')).toEqual({
    type: 'string',
  });
});
