import { QueryEngine } from './engine';

describe('Filtering', () => {
  let queryEngine: QueryEngine;

  beforeEach(() => {
    queryEngine = new QueryEngine();

    queryEngine.saveQuery('noMatch', {
      payloadQuery: [{}],
      text: 'This wont ever match any text',
    });

    queryEngine.saveQuery('errorType1', {
      types: ['error1'],
    });

    queryEngine.saveQuery('errorType2', {
      types: ['error1', 'error2'],
    });

    queryEngine.saveQuery('errorType1WithPayloadQuery', {
      types: ['error1'],
      payloadQuery: {
        'source.sessionId': 'errorType1WithPayloadQuery',
      },
    });
  });

  it('Wildcards', () => {
    queryEngine.saveQuery('wildcard1', {
      payloadQuery: [{}],
    });
    queryEngine.saveQuery('wildcard2', {
      payloadQuery: [{}, { foo: 'bar' }],
    });
    queryEngine.saveQuery('wildcard3', {
      payloadQuery: [{}, { foo: 'bar' }],
      appInstanceDepth: 1, // This always match event with no appInstanceDepth
    });

    expect(
      queryEngine.matches({
        truc: 'muche',
      })
    ).toEqual(['wildcard1', 'wildcard2', 'wildcard3']);

    expect(
      queryEngine.matches({
        truc: 'muche',
        source: {
          appInstanceDepth: 2, // Despite the wildcard, this will not match !
        },
      })
    ).toEqual(['wildcard1', 'wildcard2']);
  });

  it('Types filter', () => {
    queryEngine.saveQuery('constrainedTypeThatWillMatch', {
      types: ['error2'],
      text: 'someTextPattern',
    });

    queryEngine.saveQuery('thisWillNotMatch', {
      types: ['error1'],
      text: 'someTextPattern',
    });

    expect(
      queryEngine.matches({
        type: 'error1',
      })
    ).toEqual(['errorType1', 'errorType2']);

    expect(
      queryEngine.matches({
        type: 'error2',
        payload: {
          someUnknownField: 'someTextPattern',
        },
      })
    ).toEqual(['errorType2', 'constrainedTypeThatWillMatch']);

    expect(
      queryEngine.matches({
        type: 'error1',
        source: {
          sessionId: 'errorType1WithPayloadQuery',
        },
      })
    ).toEqual(['errorType1WithPayloadQuery', 'errorType1', 'errorType2']);
  });

  it('Payload filters', () => {
    queryEngine.saveQuery('queryWithMaxDepth2', {
      appInstanceDepth: 2,
      payloadQuery: [
        {
          'target.userTopic': ['userTopic1', 'userTopic2'],
        },
      ],
    });

    queryEngine.saveQuery('querySessionOnly', {
      appInstanceDepth: 2,
      payloadQuery: [
        {
          'source.sessionId': 'querySession',
          'target.userTopic': '',
        },
      ],
    });

    queryEngine.saveQuery('querySessionIncludingTopics', {
      appInstanceDepth: 2,
      payloadQuery: [
        {
          'source.sessionId': 'querySession',
        },
      ],
    });

    expect(
      queryEngine.matches({
        target: {
          userTopic: 'userTopic1',
        },
      })
    ).toEqual(['queryWithMaxDepth2']);

    expect(
      queryEngine.matches({
        target: {
          userTopic: 'userTopic1',
        },
        source: {
          appInstanceDepth: 3,
        },
      })
    ).toEqual([]);

    expect(
      queryEngine.matches({
        target: {},
        source: {
          sessionId: 'querySession',
        },
      })
    ).toEqual(['querySessionOnly', 'querySessionIncludingTopics']);

    expect(
      queryEngine.matches({
        target: {
          userTopic: 'userTopic3',
        },
        source: {
          sessionId: 'querySession',
        },
      })
    ).toEqual(['querySessionIncludingTopics']);
  });
});

describe('Queries updates', () => {
  let queryEngine: QueryEngine;

  beforeEach(() => {
    queryEngine = new QueryEngine();

    queryEngine.saveQuery('textQuery', {
      payloadQuery: [{}],
      text: 'This will match',
    });

    queryEngine.saveQuery('sessionOnly', {
      appInstanceDepth: 1,
      payloadQuery: [
        {
          'source.sessionId': 'sessionOnly',
          'target.userTopic': '',
        },
      ],
    });
  });

  it('Update text filter', () => {
    expect(
      queryEngine.matches({
        source: {
          someText: 'And This will match some query',
        },
      })
    ).toEqual(['textQuery']);

    queryEngine.saveQuery('textQuery', {
      payloadQuery: [{}],
      text: 'This will not match',
    });

    expect(
      queryEngine.matches({
        source: {
          someText: 'And This will match some query',
        },
      })
    ).toEqual([]);
  });

  it('Update payload filter', () => {
    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
        },
      })
    ).toEqual(['sessionOnly']);

    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
        },
        target: {
          userTopic: 'someTopic',
        },
      })
    ).toEqual([]);

    queryEngine.saveQuery('sessionOnly', {
      appInstanceDepth: 1,
      payloadQuery: [
        {
          'source.sessionId': 'sessionOnly',
        },
      ],
    });

    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
        },
        target: {
          userTopic: 'someTopic',
        },
      })
    ).toEqual(['sessionOnly']);
  });

  it('Remove a filter', () => {
    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
        },
      })
    ).toEqual(['sessionOnly']);

    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
          appInstanceDepth: 2,
        },
      })
    ).toEqual([]);

    queryEngine.saveQuery('sessionOnly', {
      payloadQuery: [
        {
          'source.sessionId': 'sessionOnly',
          'target.userTopic': '',
        },
      ],
    });

    expect(
      queryEngine.matches({
        source: {
          sessionId: 'sessionOnly',
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['sessionOnly']);
  });

  it('Remove a query', () => {
    queryEngine.saveQuery('wildcard1', {
      payloadQuery: [{}],
    });
    queryEngine.saveQuery('wildcard2', {
      payloadQuery: [{}, { foo: 'bar' }],
    });

    expect(
      queryEngine.matches({
        truc: 'muche',
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['wildcard1', 'wildcard2']);

    queryEngine.removeQuery('wildcard2');

    expect(
      queryEngine.matches({
        truc: 'muche',
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['wildcard1']);
  });
});
