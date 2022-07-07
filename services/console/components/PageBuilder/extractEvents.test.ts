import { extractEvents } from './extractEvents';

it('should extract events', () => {
  const schemas = new Map();
  schemas.set('1', {
    type: 'object',
    properties: {
      firstEvent: {
        type: 'string',
        event: true,
      },
      something: {
        type: 'object',
        properties: {
          mySecondEvent: {
            type: 'string',
            event: true,
          },
          eventMustBeAString: {
            type: 'boolean',
            event: true,
          },
          notAnEvent: {
            type: 'string',
          },
        },
      },
      letsTryAnArray: {
        type: 'array',
        items: {
          type: 'string',
          event: true,
        },
      },
      withEmptyValue: {
        type: 'object',
        properties: {
          noValue: {
            type: 'string',
            event: true,
          },
          noArrayValue: {
            type: 'array',
            items: {
              type: 'string',
              event: true,
            },
          },
        },
      },
    },
  });
  const value = {
    onInit: 'initBlock',
    updateOn: 'updateBlock',
    firstEvent: 'first-event',
    something: {
      mySecondEvent: 'second-event',
    },
    letsTryAnArray: ['third-event', 'fourth-event'],
  };
  const events = extractEvents(schemas, value);
  expect(events).toEqual([
    'first-event',
    'second-event',
    'third-event',
    'fourth-event',
    'initBlock',
    'updateBlock',
  ]);
});
