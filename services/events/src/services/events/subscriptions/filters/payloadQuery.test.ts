import { PayloadQueryProcessor } from './payloadQuery';

describe('With 1 matching query', () => {
  let payloadQuery: PayloadQueryProcessor;

  beforeEach(() => {
    payloadQuery = new PayloadQueryProcessor();
  });

  it('Wildcard query work', () => {
    payloadQuery.saveQuery('un', [
      {},
      {
        'target.userTopic': ['this will not match'],
      },
    ]);

    const matches = payloadQuery.matches({
      target: {
        userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
      },
      payload: {},
    });

    expect(matches).toEqual(['un']);
  });

  it('Exact match work', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
      },
    ]);

    const matches = payloadQuery.matches({
      target: {
        userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
      },
      source: {
        sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
      },
      payload: {},
    });

    expect(matches).toEqual(['un']);
  });

  it('Empty match work', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
        'target.userTopic': '',
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: '',
        },
        source: {
          sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
        },
        payload: {},
      })
    ).toEqual(['un']);

    expect(
      payloadQuery.matches({
        target: {
          // It can also be undefined
        },
        source: {
          sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
        },
        payload: {},
      })
    ).toEqual(['un']);
  });

  it('StartsWith match work', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.appSlug': 'Dialog*',
      },
    ]);

    const matches = payloadQuery.matches({
      target: {
        userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
      },
      source: {
        appSlug: 'Dialog Manager',
      },
      payload: {},
    });

    expect(matches).toEqual(['un']);
  });

  it('EndsWith match work', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.appSlug': '*Manager',
      },
    ]);

    const matches = payloadQuery.matches({
      target: {
        userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
      },
      source: {
        appSlug: 'Dialog Manager',
      },
      payload: {},
    });

    expect(matches).toEqual(['un']);
  });

  it('Exact match with multiple possible values work', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': ['deux', 'c68a077e-9a97-457f-a3a1-e1d0980ccf56'],
      },
    ]);

    const matches = payloadQuery.matches({
      target: {
        userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
      },
      source: {
        sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
      },
      payload: {},
    });

    expect(matches).toEqual(['un']);
  });

  it('Same field in different queries', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': ['deux', 'c68a077e-9a97-457f-a3a1-e1d0980ccf56'],
      },
      {
        'source.sessionId': 'trois',
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {},
        payload: {},
      })
    ).toEqual([]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {
          sessionId: 'trois',
        },
        payload: {},
      })
    ).toEqual(['un']);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {
          sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
        },
        payload: {},
      })
    ).toEqual(['un']);
  });

  it('Events with source.socketId and no target.currentSocket are not received by other sockets without source.socketId filter', () => {
    payloadQuery.saveQuery('sessionListener', [
      {
        'source.sessionId': 'sessionListener',
      },
    ]);

    // No source.socketId so this should match the corresponding filter as usual
    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'sessionListener',
        },
      })
    ).toEqual(['sessionListener']);

    // This won't match our filter as we did not specify a socketId filter & our queryId is different from this source.socketId
    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'sessionListener',
          socketId: 'someOtherSocket',
        },
      })
    ).toEqual([]);

    // This will match since the source.socketId is the same as our queryId
    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'sessionListener',
          socketId: 'sessionListener', // This matches thanks to the same socketId as the query have
        },
      })
    ).toEqual(['sessionListener']);

    // This will match as well thanks to the source.socketId: * filter
    payloadQuery.saveQuery('sessionListener', [
      {
        'source.sessionId': 'sessionListener',
        'source.socketId': '*',
      },
    ]);
    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'sessionListener',
          socketId: 'someOtherSocket',
        },
      })
    ).toEqual(['sessionListener']);
  });
});

describe('Without matching query', () => {
  let payloadQuery: PayloadQueryProcessor;

  beforeEach(() => {
    payloadQuery = new PayloadQueryProcessor();
  });

  it('No query', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {
          sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf5',
        },
        payload: {},
      })
    ).toEqual([]);
  });

  it('Missing field', () => {
    payloadQuery.saveQuery('un', [
      {
        'target.userTopic': 'conversation:6647829ce163bcfd9d4cfc31',
        'source.sessionId': 'c68a077e-9a97-457f-a3a1-e1d0980ccf56',
      },
      {
        'payload.foo': '*',
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {
          sessionId: 'c68a077e-9a97-457f-a3a1-e1d0980ccf5',
        },
        payload: {},
      })
    ).toEqual([]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        payload: {},
      })
    ).toEqual([]);
  });

  it('Exact mismatch', () => {
    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': 'un',
      },
      {
        'payload.foo': '*',
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'conversation:6647829ce163bcfd9d4cfc31',
        },
        source: {
          sessionId: 'une',
        },
        payload: {},
      })
    ).toEqual([]);
  });
});

describe('With multiple queries', () => {
  let payloadQuery: PayloadQueryProcessor;

  beforeEach(() => {
    payloadQuery = new PayloadQueryProcessor();

    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': 'un',
        'target.userTopic': '',
      },
      {
        'target.userTopic': 'messages',
        'source.sessionId': '',
      },
    ]);

    payloadQuery.saveQuery('wildcard', [
      {
        'some.unknown.field': 'none',
      },
      {},
    ]);

    payloadQuery.saveQuery('trois', [
      {
        'source.sessionId': 'trois',
      },
      {
        'target.userTopic': 'messages',
      },
    ]);

    payloadQuery.saveQuery('quatre', [
      {
        'source.sessionId': 'quatre',
        'target.userTopic': 'messages',
      },
    ]);
  });

  it('Distinct queries with same filter match together', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'messages',
        },
        payload: {},
      })
    ).toEqual(['wildcard', 'un', 'trois']);

    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'quatre',
        },
        target: {
          userTopic: 'messages',
        },
        payload: {},
      })
    ).toEqual(['wildcard', 'quatre', 'trois']);
  });
});

describe('Queries can be updated', () => {
  let payloadQuery: PayloadQueryProcessor;

  beforeEach(() => {
    payloadQuery = new PayloadQueryProcessor();

    payloadQuery.saveQuery('un', [
      {
        'source.sessionId': 'un',
        'target.userTopic': '',
      },
      {
        'target.userTopic': 'messages',
        'source.sessionId': '',
      },
    ]);

    payloadQuery.saveQuery('wildcard', [
      {
        'some.unknown.field': 'none',
      },
      {},
    ]);

    payloadQuery.saveQuery('trois', [
      {
        'source.sessionId': 'trois',
      },
      {
        'target.userTopic': 'messages',
      },
    ]);

    payloadQuery.saveQuery('quatre', [
      {
        'source.sessionId': 'quatre',
        'target.userTopic': 'messages',
      },
    ]);
  });

  it('Filters can be removed', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'messages',
        },
      })
    ).toEqual(['wildcard', 'un', 'trois']);

    payloadQuery.saveQuery('trois', [
      {
        'source.sessionId': 'trois',
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'messages',
        },
      })
    ).toEqual(['wildcard', 'un']);
  });

  it('Filters can be updated', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'messages',
        },
      })
    ).toEqual(['wildcard', 'un', 'trois']);

    payloadQuery.saveQuery('trois', [
      {
        'source.sessionId': 'nouveau trois',
      },
    ]);

    expect(
      payloadQuery.matches({
        source: {
          sessionId: 'nouveau trois',
        },
      })
    ).toEqual(['wildcard', 'trois']);
  });

  it('Wilcards can be removed', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'someUnknownTopic',
        },
      })
    ).toEqual(['wildcard']);

    payloadQuery.saveQuery('wildcard', []);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'someUnknownTopic',
        },
      })
    ).toEqual([]);
  });

  it('Multiple values matches can be updated', () => {
    payloadQuery.saveQuery('cinq', [
      {
        'target.userTopic': ['cinq', 'six'],
      },
    ]);
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'six',
        },
      })
    ).toEqual(['wildcard', 'cinq']);

    payloadQuery.saveQuery('cinq', [
      {
        'target.userTopic': ['cinq', 'sept'],
      },
    ]);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'six',
        },
      })
    ).toEqual(['wildcard']);

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'sept',
        },
      })
    ).toEqual(['wildcard', 'cinq']);
  });

  it('Queries can be removed', () => {
    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'unknown topic',
        },
      })
    ).toEqual(['wildcard']);

    payloadQuery.removeQuery('wildcard');

    expect(
      payloadQuery.matches({
        target: {
          userTopic: 'unknown topic',
        },
      })
    ).toEqual([]);
  });
});
