import {
  computeBlocks,
  interpolate,
  interpolateExpression,
  repeatBlocks,
  testCondition,
} from './computeBlocks';

it('should display conditionally', () => {
  expect(
    testCondition('{{test}}', {
      test: true,
    })
  ).toBeTruthy();
  expect(
    testCondition('!{{test}}', {
      test: true,
    })
  ).toBeFalsy();
  expect(
    testCondition('{{test}}', {
      test: false,
    })
  ).toBeFalsy();
  expect(
    testCondition('!{{test}}', {
      test: false,
    })
  ).toBeTruthy();
  expect(testCondition('{{test}}', {})).toBeFalsy();
  expect(testCondition('!{{test}}', {})).toBeTruthy();
  expect(testCondition('true', {})).toBeTruthy();
  expect(testCondition('!true', {})).toBeFalsy();
  expect(testCondition('false', {})).toBeFalsy();
  expect(testCondition('!false', {})).toBeTruthy();
});

it('should interpolate expression', () => {
  expect(interpolateExpression('{{foo}}', { foo: 'Foo' })).toBe('Foo');
  expect(
    interpolateExpression('{{foo}} {{bar}}', { foo: 'Foo', bar: 'Bar' })
  ).toBe('Foo Bar');
  expect(interpolateExpression('{{foo}} {{bar}}', {})).toBe(' ');
});

it('should interpolate object', () => {
  expect(
    interpolate(
      {
        blocks: [
          {
            slug: 'RichText',
            content: '{{Untouched}}',
          },
        ],
        stringValue: '{{string}}',
        objectValue: {
          foo: '{{object.foo}}',
          bar: '{{object.bar}}',
        },
        arrayValue: [
          '{{array}}',
          {
            label: '{{array}}',
          },
        ],
      },
      {
        string: 'StringValue',
        object: {
          foo: 'Foo',
          bar: 'Bar',
        },
        array: 'array',
      }
    )
  ).toEqual({
    blocks: [
      {
        slug: 'RichText',
        content: '{{Untouched}}',
      },
    ],
    stringValue: 'StringValue',
    objectValue: {
      foo: 'Foo',
      bar: 'Bar',
    },
    arrayValue: [
      'array',
      {
        label: 'array',
      },
    ],
  });
});

it('should repeat blocks', () => {
  expect(
    repeatBlocks(
      {
        content: '{{item}}',
      },
      {
        on: '{{items}}',
      },
      {
        items: ['foo', 'bar'],
      }
    )
  ).toEqual([
    {
      content: 'foo',
      item: 'foo',
      $index: 0,
    },
    {
      content: 'bar',
      item: 'bar',
      $index: 1,
    },
  ]);

  expect(
    repeatBlocks(
      {
        content: '{{truc.label}}',
      },
      {
        on: '{{items}}',
        as: 'truc',
      },
      {
        items: [{ label: 'foo' }, { label: 'bar' }],
      }
    )
  ).toEqual([
    {
      content: 'foo',
      truc: { label: 'foo' },
      $index: 0,
    },
    {
      content: 'bar',
      truc: { label: 'bar' },
      $index: 1,
    },
  ]);
});

it('should compute blocks', () => {
  expect(
    computeBlocks(
      {
        blocks: [
          {
            slug: 'RichText',
            content: 'Visible',
            'template.if': '{{world}}',
          },
          {
            slug: 'RichText',
            content: 'Hidden',
            'template.if': '!{{world}}',
          },
        ],
        content: 'Hello {{world}}',
      },
      {
        world: 'World',
      }
    )
  ).toEqual({
    blocks: [
      {
        slug: 'RichText',
        content: 'Visible',
      },
    ],
    content: 'Hello World',
  });
});

it('should interpolate expression with filters', () => {
  expect(
    interpolateExpression("{{foo|date:'LL'}}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
    })
  ).toBe('July 11, 2023');
  expect(
    interpolateExpression("{{foo|date:'LL',lang}}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
      lang: 'fr',
    })
  ).toBe('11 juillet 2023');
  expect(
    interpolateExpression("{{foo|date:'LL', lang }}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
      lang: 'fr',
    })
  ).toBe('11 juillet 2023');

  expect(
    interpolateExpression("{{foo|if:'foo','bar'}}", {
      foo: true,
    })
  ).toBe('foo');
  expect(
    interpolateExpression("{{foo|if:'foo','bar'}}", {
      foo: false,
    })
  ).toBe('bar');
  expect(
    interpolateExpression('{{ foo | if : foo, bar }}', {
      foo: 'FOO',
      bar: 'BAR',
    })
  ).toBe('FOO');
});

it('should not read self value', () => {
  expect(
    computeBlocks(
      {
        slug: 'RichText',
        content: '{{content}}',
      },
      {
        content: 'Foo',
      }
    )
  ).toEqual({
    blocks: undefined,
    slug: 'RichText',
    content: 'Foo',
  });
});

it('should read self value', () => {
  expect(
    computeBlocks(
      {
        slug: 'RichText',
        content: '{{foo}}',
        foo: 'Foo',
      },
      {}
    )
  ).toEqual({
    blocks: undefined,
    slug: 'RichText',
    content: 'Foo',
    foo: 'Foo',
  });
});
