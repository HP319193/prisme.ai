import { AppInstanceDepthQueryProcessor } from './appInstanceDepthQuery';

describe('MaxDepth filtering', () => {
  let depthQuery: AppInstanceDepthQueryProcessor;

  beforeEach(() => {
    depthQuery = new AppInstanceDepthQueryProcessor();

    depthQuery.saveQuery('trois', 3);
    depthQuery.saveQuery('deux', 2);
    depthQuery.saveQuery('quatre', 4);
    depthQuery.saveQuery('zero', 0);
  });

  it('Events with no depth match all queries', () => {
    expect(
      depthQuery.matches({
        source: {},
      })
    ).toEqual(['quatre', 'trois', 'deux', 'zero']);
  });

  it('Events match queries with same maxDepth', () => {
    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 4,
        },
      })
    ).toEqual(['quatre']);
  });

  it('Events match queries with same & bigger maxDepth', () => {
    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['quatre', 'trois', 'deux']);
  });
});

describe('Queries update', () => {
  let depthQuery: AppInstanceDepthQueryProcessor;

  beforeEach(() => {
    depthQuery = new AppInstanceDepthQueryProcessor();

    depthQuery.saveQuery('trois', 3);
    depthQuery.saveQuery('deux', 2);
    depthQuery.saveQuery('quatre', 4);
    depthQuery.saveQuery('zero', 0);
  });

  it('Quey maxDepth can be updated', () => {
    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 4,
        },
      })
    ).toEqual(['quatre']);

    depthQuery.saveQuery('quatre', 2);

    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 4,
        },
      })
    ).toEqual([]);
    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['trois', 'deux', 'quatre']);
  });

  it('Quey can be removed', () => {
    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['quatre', 'trois', 'deux']);

    depthQuery.removeQuery('deux');

    expect(
      depthQuery.matches({
        source: {
          appInstanceDepth: 2,
        },
      })
    ).toEqual(['quatre', 'trois']);
  });
});
