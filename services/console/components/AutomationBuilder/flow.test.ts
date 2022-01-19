import { addInstructionFromFlow, buildFlow } from './flow';

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

it('should add an instruction at first place', () => {
  expect(addInstructionFromFlow(automation, '0', { emit: 'win' })).toEqual({
    name: 'example',
    trigger: {
      events: ['apps.foo', 'apps.bar'],
    },
    do: [
      {
        emit: 'win',
      },
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
  });
});

it('should add an instruction in first level', () => {
  expect(addInstructionFromFlow(automation, '0.3', { emit: 'win' })).toEqual({
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
        emit: 'win',
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
  });
});

it('should add an instruction in a condition', () => {
  expect(
    addInstructionFromFlow(automation, '0.4.0.1', { emit: 'win' })
  ).toEqual({
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
              emit: 'win',
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
  });
});

it('should add an instruction in top of a condition', () => {
  expect(addInstructionFromFlow(automation, '0.4.0', { emit: 'win' })).toEqual({
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
              emit: 'win',
            },
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
  });
});
