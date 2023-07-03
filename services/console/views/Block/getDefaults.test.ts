import { getDefaults } from './getDefaults';

it('should get defaults', () => {
  expect(
    getDefaults({
      type: 'object',
      properties: {
        foo: {
          default: 'bar',
        },
      },
    })
  ).toEqual({
    foo: 'bar',
  });
});

it('should get defaults in mono prop', () => {
  expect(
    getDefaults({
      type: 'string',
      default: 'bar',
    })
  ).toEqual('bar');
  expect(
    getDefaults({
      default: 'bar',
    })
  ).toEqual('bar');
  expect(
    getDefaults({
      type: 'object',
      default: {
        bar: true,
      },
      properties: {
        bar: {
          type: 'string',
        },
      },
    })
  ).toEqual({
    bar: true,
  });
});

it('should get defaults deep', () => {
  expect(
    getDefaults({
      type: 'object',
      properties: {
        foo: {
          type: 'object',
          properties: {
            bar: {
              default: 'yeah',
            },
            babar: {
              type: 'object',
              properties: {
                bababar: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    })
  ).toEqual({
    foo: {
      bar: 'yeah',
    },
  });
});
