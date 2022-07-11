import { injectConditions } from './rulesBuilder';

it('injectConditions should replace user & subject variables', () => {
  const replaced = injectConditions(
    {
      'target.topic': {
        $in: '${user.topics}',
      },
      'source.workspaceId': '${subject.id}',
      'source.userId': '${user.id}',
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
    }
  );

  expect(replaced).toEqual({
    'target.topic': {
      $in: ['myTopic1', 'myTopic2'],
    },
    'source.workspaceId': 'myWorkspaceId',
    'source.userId': 'myUserId',
  });
});

it('injectConditions should prevent broken conditions', () => {
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

  expect(replaced).toEqual({
    'target.topic': {
      $in: [],
    },
    'target.otherTopic': {
      $in: [],
    },
    'target.otherTopicBis': {
      $in: [],
    },
  });
});
