import { buildFlow } from './flow';

const automation = {
  name: 'example',
  trigger: {
    events: ['apps.foo', 'apps.bar'],
  },
  do: [
    {
      emit: {
        event: 'apps.foobar',
        payload: {
          foo: 'bar',
        },
        private: true,
      },
    },
    {
      wait: {
        event: 'apps.forIt',
        output: 'value',
      },
    },
    {
      set: {
        name: 'foo',
        value: '$value',
        lifespan: 42,
      },
    },
    {
      delete: {
        name: 'bar',
      },
    },
    {
      conditions: {
        '$a == 1': [
          {
            emit: 'apps.1',
          },
          {
            emit: 'apps.2',
          },
        ],
        default: [
          {
            all: [
              {
                emit: 'apps.3',
              },
              {
                emit: 'apps.4',
              },
              {
                repeat: {
                  on: '$a',
                  then: [
                    {
                      emit: 'apps.5',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

it('should build flow', () => {
  expect(buildFlow(automation)).toMatchSnapshot();
});
