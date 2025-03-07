import { injectConditions, injectRules } from './rulesBuilder';

it('injectConditions should replace user & subject variables', () => {
  const replaced = injectConditions(
    {
      'target.topic': {
        $in: '${user.topics}',
      },
      'source.workspaceId': '${subject.id}',
      'source.userId': '${user.id}',
      'source.sessionId': '${user.sessionId}',
      'source.sessionIdAlias': '${session.id}',
      isntReplaced: '{user.id}',
      alsoWorks: '{{user.id}}',
      customCtx: '{{session.foo}}',
    },
    {
      user: {
        id: 'myUserId',
        sessionId: 'sessionId',
        topics: ['myTopic1', 'myTopic2'],
      },
      subject: {
        id: 'myWorkspaceId',
      },
      session: {
        foo: 'bar',
      },
    }
  );

  expect(replaced).toEqual({
    'target.topic': {
      $in: ['myTopic1', 'myTopic2'],
    },
    'source.workspaceId': 'myWorkspaceId',
    'source.userId': 'myUserId',
    'source.sessionId': 'sessionId',
    'source.sessionIdAlias': 'sessionId',
    isntReplaced: '{user.id}',
    alsoWorks: 'myUserId',
    customCtx: 'bar',
  });
});

it('injectConditions should mark conditions with missing vars as invalid', () => {
  const replaced = injectConditions(
    {
      'target.topic': {
        $in: undefined,
      },
      'target.otherTopic': {
        $in: '${user.foo}',
      },
      'target.otherTopicBis': {
        $in: '${user.myString}',
      },
    },
    {
      user: {
        foo: undefined,
        myString: '',
      } as any,
      subject: {},
    }
  );

  expect(replaced).toEqual(false);
});

it('injectRules should replace user & subject variables while skipping rules with missing vars', () => {
  const user = {
    id: 'userID',
  };

  expect(
    injectRules(
      [
        {
          action: 'manage',
          subject: 'all',
          conditions: { 'permissions.${user.id}.policies.manage': true },
        },
        {
          action: 'manage',
          subject: 'files',
          conditions: { 'permissions.${user.sessionId}.policies.manage': true },
        },
      ],
      { user }
    )
  ).toEqual([
    {
      action: 'manage',
      subject: 'all',
      conditions: { 'permissions.userID.policies.manage': true },
    },
  ]);
});
