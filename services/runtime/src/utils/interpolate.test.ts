import { interpolate } from './interpolate';

it('should not crash when obtaining stream with null parts', async () => {
  const replacedStream = interpolate(
    [
      { type: 'text', value: 'Nothing to replace.' },
      { type: 'text', value: null },
      null,
    ],
    {}
  );

  expect(replacedStream).toEqual([
    { type: 'text', value: 'Nothing to replace.' },
    { type: 'text', value: null },
    null,
  ]);
});

it('should replace successfully in a simple string', async () => {
  const replacedStream = interpolate('{{param}}', { param: 'Hello' });

  expect(replacedStream).toEqual('Hello');
});

it('should replace successfully a singled-out param by its value', async () => {
  const replacedStream = interpolate('{{param}}', {
    param: ['Hello', 'beautiful', 'array'],
  });

  expect(replacedStream).toEqual(['Hello', 'beautiful', 'array']);
});

it('should replace successfully a nested param', async () => {
  const replacedStream = interpolate('{{param[0]}}', {
    param: ['Hello', 'beautiful', 'array'],
  });

  expect(replacedStream).toEqual('Hello');
});

it('should replace successfully a specific char by string index', async () => {
  const replacedStream = interpolate('{{param[0]}}', {
    param: 'Hello',
  });

  expect(replacedStream).toEqual('H');
});

it('should replace successfully a singled-out param with value 0', async () => {
  const replacedStream = interpolate('{{param}}', {
    param: 0,
  });

  expect(replacedStream).toEqual(0);
});

it('should not replace anything and return exact same stream', async () => {
  const replacedStream = interpolate(
    [{ type: 'text', value: 'Nothing to replace.' }],
    {}
  );

  expect(replacedStream).toEqual([
    { type: 'text', value: 'Nothing to replace.' },
  ]);
});

it('should remove undefined variables', async () => {
  const replacedStream = interpolate(
    [{ type: 'text', value: 'This will be cleared : {{foo}}' }],
    {
      foo: undefined,
    }
  );

  expect(replacedStream).toEqual([
    { type: 'text', value: 'This will be cleared : ' },
  ]);
});

it('should replace in text', async () => {
  const replacedStream = interpolate(
    [{ type: 'text', value: 'I love {{fruit}} and {{vegetables}}.' }],
    { fruit: 'apple', vegetables: 'onions' }
  );

  expect(replacedStream).toEqual([
    { type: 'text', value: 'I love apple and onions.' },
  ]);
});

it('should replace in cards titles and description', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'card',
        value: 'I love {{fruit}} and {{vegetables}}.',
        title: '{{title}}',
      },
    ],
    { fruit: 'apple', vegetables: 'onions', title: 'My favorite food' }
  );

  expect(replacedStream).toEqual([
    {
      type: 'card',
      value: 'I love apple and onions.',
      title: 'My favorite food',
    },
  ]);
});

it('should replace in cards buttons', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'card',
        value: 'Description',
        title: 'Title',
        buttons: [
          { type: 'event', text: 'Mon évènement', value: 'TRIGGER_{{event}}' },
          { type: 'link', text: 'Mon site web', value: '{{url}}' },
          {
            type: 'link',
            text: 'Mon site web',
            value: 'https://mon.site.web/search?q={{parameter}}',
          },
        ],
      },
    ],
    {
      event: 'WOW',
      url: 'https://amazing.work.com/',
      parameter: 'a subtle search',
    }
  );

  expect(replacedStream).toEqual([
    {
      type: 'card',
      value: 'Description',
      title: 'Title',
      buttons: [
        { type: 'event', text: 'Mon évènement', value: 'TRIGGER_WOW' },
        {
          type: 'link',
          text: 'Mon site web',
          value: 'https://amazing.work.com/',
        },
        {
          type: 'link',
          text: 'Mon site web',
          value: 'https://mon.site.web/search?q=a subtle search',
        },
      ],
    },
  ]);
});

it('should replace in a string array', async () => {
  const params = {
    secondValue: 'deuxieme choix',
  };
  const input = [
    {
      questions: [
        {
          'say question': {
            output: 'mySelect',
            labels: 'Quelle valeur choisir ?',
            validator: {
              values: {
                value: ['premier choix', '{{secondValue}}', 'troisième choix'],
              },
            },
          },
        },
      ],
      buttons: [{ 'say button': { text: 'Valider', value: 'confirm' } }],
      type: 'form',
    },
  ];
  const replacedStream = interpolate(input, params);
  expect(replacedStream).toEqual([
    {
      questions: [
        {
          'say question': {
            output: 'mySelect',
            labels: 'Quelle valeur choisir ?',
            validator: {
              values: {
                value: ['premier choix', 'deuxieme choix', 'troisième choix'],
              },
            },
          },
        },
      ],
      buttons: [{ 'say button': { text: 'Valider', value: 'confirm' } }],
      type: 'form',
    },
  ]);
});

it('should replace and display a stringify object for objet parameters', async () => {
  const user = { email: 'john.doe@mail.com', name: 'John Doe' };
  const replacedStream = interpolate(
    [
      {
        type: 'text',
        value: 'This is everything we know about you : {{user}}.',
      },
    ],
    { user }
  );

  expect(replacedStream).toEqual([
    {
      type: 'text',
      value: `This is everything we know about you : ${JSON.stringify(
        user,
        null,
        '  '
      )}.`,
    },
  ]);
});

it('should replace without stringifying in case of nested variables', async () => {
  const slots = {
    entity: 'outil',
    entities: {
      outil: {
        vocabulary: {
          Visio: ['Visio', 'Visio', 'Visio'],
          Imprimante: ['Imprimante', 'Imprimante', 'Imprimante'],
        },
      },
    },
  };
  const replacedStream = interpolate(
    {
      repeat: {
        on: '{{entities[{{entity}}].vocabulary}}',
        do: [],
      },
    },
    slots
  );

  expect(replacedStream).toEqual({
    repeat: {
      on: slots.entities[slots.entity].vocabulary,
      do: [],
    },
  });
});

it('should not replace a parameter which starts with the name of another parameter', async () => {
  const user = { email: 'john.doe@mail.com', name: 'John Doe' };
  const replacedStream = interpolate(
    [
      {
        type: 'text',
        value: 'This is everything we know about you : {{userOtherVariable}}.',
      },
    ],
    { user, userOtherVariable: 'Nothing' }
  );

  expect(replacedStream).toEqual([
    {
      type: 'text',
      value: `This is everything we know about you : Nothing.`,
    },
  ]);
});

it('should replace nested parameters', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'text',
        value: 'You are {{user.name}} and this is your email : {{user.email}}.',
      },
    ],
    { user: { email: 'john.doe@mail.com', name: 'John Doe' } }
  );

  expect(replacedStream).toEqual([
    {
      type: 'text',
      value: 'You are John Doe and this is your email : john.doe@mail.com.',
    },
  ]);
});

it('should replace nested dynamic parameters', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'text',
        value: 'This is your email : {{emails["{{user.name}}"]}}.',
      },
    ],
    {
      user: { name: 'John Doe' },
      emails: {
        'John Doe': 'john.doe@mail.com',
      },
    }
  );

  expect(replacedStream).toEqual([
    {
      type: 'text',
      value: 'This is your email : john.doe@mail.com.',
    },
  ]);
});

it('should replace nested parameters with underscore in it', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'text',
        value:
          'You are {{us_er.name}} and this is your email : {{us_er.em_ail}}.',
      },
    ],
    { us_er: { em_ail: 'john.doe@mail.com', name: 'John Doe' } }
  );

  expect(replacedStream).toEqual([
    {
      type: 'text',
      value: 'You are John Doe and this is your email : john.doe@mail.com.',
    },
  ]);
});

it('should replace nested arrays parameters', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'function',
        resource: 'myFunction',
        parameters: {
          myData: '{{myData}}',
        },
      },
    ],
    {
      myData: [
        [1, 2, 3],
        [1, { deux: 2 }, 3],
        [1, 2, [3]],
        [1, { deux: [2] }, 3],
      ],
    }
  );

  expect(replacedStream).toEqual([
    {
      type: 'function',
      resource: 'myFunction',
      parameters: {
        myData: [
          [1, 2, 3],
          [1, { deux: 2 }, 3],
          [1, 2, [3]],
          [1, { deux: [2] }, 3],
        ],
      },
    },
  ]);
});

it('should replace by nothing when going too deep', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'richText',
        value:
          'You are {{user.name.first}} and this is your email : {{user.email}}.',
      },
    ],
    { user: { email: 'john.doe@mail.com', name: 'John Doe' } }
  );

  expect(replacedStream).toEqual([
    {
      type: 'richText',
      value: 'You are  and this is your email : john.doe@mail.com.',
    },
  ]);
});

it('should replace by an empty string a parameter which is not in the context', async () => {
  const replacedStream = interpolate(
    [
      {
        type: 'richText',
        value: 'I love {{fruit}} and {{vegetables}}.',
      },
    ],
    { fruit: 'apple' }
  );

  expect(replacedStream).toEqual([
    {
      type: 'richText',
      value: 'I love apple and .',
    },
  ]);
});

it('array of numbers should be kept intact', async () => {
  const replacedStream = interpolate(
    [
      {
        'say text': '{{lieux}}',
      },
    ],
    {
      lieux: [
        {
          _id: '612d0097ac1e3fbc4a04d485',
          name: 'Ecole du Champ de Foire (sous videoprotection)',
          address: 'Rue du Champ de Foire',
          type: 'Bâtiments scolaires',
          location: {
            type: 'Point',
            coordinates: [47.0826436, 2.3865358],
          },
          updatedAt: '2021-08-30T16:00:23.069Z',
        },
      ],
      type: 'Bâtiments scolaires',
    }
  );

  expect(replacedStream).toEqual([
    {
      'say text': [
        {
          _id: '612d0097ac1e3fbc4a04d485',
          name: 'Ecole du Champ de Foire (sous videoprotection)',
          address: 'Rue du Champ de Foire',
          type: 'Bâtiments scolaires',
          location: {
            type: 'Point',
            coordinates: [47.0826436, 2.3865358],
          },
          updatedAt: '2021-08-30T16:00:23.069Z',
        },
      ],
    },
  ]);
});

it('should support an option undefinedVars : "leave"', async () => {
  expect(
    interpolate(
      [
        {
          type: 'text',
          value: 'This is everything we know about you : {{unknownVar}}',
        },
      ],
      {},
      {
        undefinedVars: 'leave',
      }
    )
  ).toEqual([
    {
      type: 'text',
      value: `This is everything we know about you : {{unknownVar}}`,
    },
  ]);
});

describe('Expressions can be evaluated with {% %}', () => {
  it('Basic expressions', () => {
    expect(interpolate('{% 1 < 2 %}', {})).toBe(true);
    expect(interpolate('stringified = {% 1 > 2 %}', {})).toEqual(
      'stringified = false'
    );
    expect(interpolate('stringified = {% 1 > 2 %} \n {% 2 > 1 %}', {})).toEqual(
      'stringified = false \n true'
    );
  });

  it('Variables inside expressions', () => {
    expect(
      interpolate('{% date({{run.date}}).date %}', {
        run: {
          date: '2023-03-31T16:38:51.190Z',
        },
      })
    ).toEqual(31);

    const ctx = {
      key: 'date',
      run: {
        date: '2023-03-31T16:38:51.190Z',
      },
    };
    expect(interpolate('{% date({{run[{{key}}]}}).date %}', ctx)).toEqual(31);

    // This let preventing some variable expression from being interpolated !
    expect(interpolate('{% "{{someVar}}" %}', {})).toEqual('{{someVar}}');
    expect(
      interpolate('{% "{% date({{run[{{key}}]}}).date %}" %}', {})
    ).toEqual('{% date({{run[{{key}}]}}).date %}');
    expect(
      interpolate(
        interpolate('{% "{% date({{run[{{key}}]}}).date %}" %}', {}),
        ctx
      )
    ).toEqual(31);
  });

  it('Nested expressions', () => {
    expect(
      interpolate('{% date({{run.date}}).date %} < 2', {
        run: {
          date: '2023-03-31T16:38:51.190Z',
        },
      })
    ).toEqual('31 < 2');

    expect(
      interpolate('{% {% date({{run[{{key}}]}}).date %} < 30 %}', {
        key: 'date',
        run: {
          date: '2023-03-31T16:38:51.190Z',
        },
      })
    ).toEqual(false);
    expect(
      interpolate('{% {% date({{run[{{key}}]}}).date %} < 32 %}', {
        key: 'date',
        run: {
          date: '2023-03-31T16:38:51.190Z',
        },
      })
    ).toEqual(true);
    expect(
      interpolate('{% {% date({{run[{{key}}]}}).date %} < {{max}} %}', {
        key: 'date',
        run: {
          date: '2023-03-31T16:38:51.190Z',
        },
        max: 32,
      })
    ).toEqual(true);

    expect(
      interpolate(
        '{% date({{run[{{key}}]}}).date  < date({{run[date2]}}).date %}',
        {
          key: 'date',
          run: {
            date: '2023-03-28T16:38:51.190Z',
            date2: '2023-03-31T16:38:51.190Z',
          },
        }
      )
    ).toEqual(true);

    // Also works with multiple {% expressions %}
    expect(
      interpolate(
        '{% date({{run[{{key}}]}}, "l", "fr") %} at {% date({{run[date2]}}, "LT", "fr") %}',
        {
          key: 'date',
          run: {
            date: '2023-03-31T16:38:51.190Z',
            date2: '2023-03-31T16:38:51.190Z',
          },
        }
      )
    ).toEqual('31/3/2023 at 18:38');

    expect(
      interpolate('{{un}} et {{deux}}', {
        un: 'un+{{deux}}',
        deux: 'trois',
      })
    ).toEqual('un+trois et trois');
  });
});
