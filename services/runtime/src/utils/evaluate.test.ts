import { evaluate } from './evaluate';

describe('Math.js should handle basic conditions features', () => {
  it('should handle parenthesis', () => {
    expect(evaluate('(true || false) and true')).toEqual(true);
    expect(evaluate('( false || false ) and true')).toEqual(false);
    expect(evaluate('(false || false) and true')).toEqual(false);
    expect(evaluate('true || false and false')).toEqual(true);
    expect(evaluate('true || (false and false)')).toEqual(true);
  });

  it('should handle or operator', async () => {
    expect(evaluate('true || false')).toEqual(true);
    expect(evaluate('true or false')).toEqual(true);
  });

  it('should handle and operator', async () => {
    expect(evaluate('true && false')).toEqual(false);
    expect(evaluate('true and false')).toEqual(false);
  });

  it('should handle equality', async () => {
    expect(evaluate(`"maVariable" === "maVariable"`)).toEqual(true);
    expect(evaluate(`"maVariable" == "maVariable"`)).toEqual(true);
    expect(evaluate(`"maVariable" equals "maVariable"`)).toEqual(true);
  });

  it('should handle difference', async () => {
    expect(evaluate(`"maVariable" !== "Variable"`)).toEqual(true);
    expect(evaluate(`"maVariable" != "Variable"`)).toEqual(true);
    expect(evaluate(`"maVariable" not equals "maVariable"`)).toEqual(false);
  });

  it('should handle superior and inferior operators', async () => {
    expect(evaluate(`1 > 2`)).toEqual(false);
    expect(evaluate(`2 >= 2`)).toEqual(true);
    expect(evaluate(`"a" < "b"`)).toEqual(true);
    expect(evaluate(`"ba" <= "ba"`)).toEqual(true);
  });

  it('should handle negation statement', () => {
    expect(evaluate('true && !false')).toEqual(true);
    expect(evaluate('!true || false')).toEqual(false);
    expect(evaluate(`!""`)).toEqual(true);
    expect(evaluate(`!"Bonjour"`)).toEqual(false);
    expect(evaluate(`!true`)).toEqual(false);
    expect(evaluate(`!( true )`)).toEqual(false); // parenthesis are not correctly supported, without space between a parenthesis and a boolean the node is not found as a boolean, but a variable...
  });

  it('should handle exists and not-exists operators', async () => {
    expect(evaluate(`undefined exists`)).toEqual(false);
    expect(evaluate(`null exists`)).toEqual(false);
    expect(evaluate(`0 exists`)).toEqual(true);
    expect(evaluate(`"ba" not exists`)).toEqual(false);
    expect(evaluate(`"" not exists`)).toEqual(false); // It exists, it is just an empty string!
  });

  it('should handle match operator', async () => {
    expect(evaluate(`"bonjour" matches "bon"`)).toEqual(true);
  });

  it('should handle text operators insensitively', async () => {
    expect(evaluate('true OR false')).toEqual(true);
    expect(evaluate('true or false')).toEqual(true);
    expect(evaluate('true AND false')).toEqual(false);
    expect(evaluate('true and false')).toEqual(false);
    expect(evaluate(`"bonjour" MATCHES "bon"`)).toEqual(true);
    expect(evaluate(`"bonjour" MaTcHeS "bon"`)).toEqual(true);
    expect(evaluate(`"bonjour" matches "bon"`)).toEqual(true);
  });

  it('should work with strings without delimiters', () => {
    expect(evaluate('bonjour')).toEqual(true);
    expect(evaluate('bonjour matches bon')).toEqual(true);
    expect(evaluate('salut !== aurevoir')).toEqual(true);
    expect(evaluate(`"salut" !== 'salut'`)).toEqual(false);
    expect(
      evaluate(`"salut, moi c'est michel!" === 'salut, moi c pas michel.'`)
    ).toEqual(false);
    expect(evaluate('salut !== salut')).toEqual(false);
  });

  it('should work with strings including operator names', () => {
    expect(evaluate('bonjor matches "or"')).toEqual(true);
    // TODO These still fail if not wrapped by double quotes
    expect(evaluate('bonjour matches "matches"')).toEqual(false);
    expect(evaluate('"matches" matches "matches"')).toEqual(true);
  });
});

describe('It should handle variables within {{}}', () => {
  it('works with strings', () => {
    expect(evaluate('{{maVar}} === {{maVar}}', { maVar: 'hello' })).toEqual(
      true
    );
    expect(
      evaluate('{{foo}} matches {{bar}}', { foo: 'hello', bar: 'hell' })
    ).toEqual(true);
    expect(
      evaluate('{{foo}} !== {{bar}}', { foo: 'hello', bar: 'hell' })
    ).toEqual(true);
    expect(
      evaluate('{{foo}} && {{bar}}', { foo: 'hello', bar: 'hell' })
    ).toEqual(true);
    expect(evaluate('{{foo}} && {{bar}}', { foo: 'hello', bar: '' })).toEqual(
      false
    );
    expect(evaluate('{{foo}}', {})).toEqual(false);
    expect(evaluate("'cheers' === {{foo}}", {})).toEqual(false);
  });

  it('works with boolean', () => {
    expect(evaluate('{{foo}} === {{bar}}', { foo: true, bar: true })).toEqual(
      true
    );
    expect(evaluate('!{{foo}} === {{bar}}', { foo: true, bar: true })).toEqual(
      false
    );
    expect(
      evaluate('!({{foo}} === {{bar}})', { foo: true, bar: true })
    ).toEqual(false);
    expect(
      evaluate('!({{foo}} === {{bar}})', { foo: true, bar: true })
    ).toEqual(false);
  });

  it('works with nested parameters', () => {
    expect(
      evaluate('{{foo.bar}} === {{bar.foo.deep}}', {
        foo: { bar: false },
        bar: { foo: { deep: true } },
      })
    ).toEqual(false);
    expect(
      evaluate('{{hub.verify_token}} === "ok"', {
        hub: { verify_token: 'ok' },
      })
    ).toEqual(true);
  });

  it('does not work yet with array or object comparaisons', () => {
    expect(
      evaluate('{{foo}} !== {{bar}}', {
        foo: { bar: false },
        bar: { foo: { deep: true } },
      })
    ).toEqual(true);
    expect(
      evaluate('{{foo}} === {{bar}}', {
        foo: { bar: false },
        bar: { foo: { deep: true } },
      })
    ).toEqual(false);
  });

  it('should handle in operator', async () => {
    const mylist = ['un', 'deux', 'trois'];
    expect(
      evaluate(`{{foo}} in {{mylist}}`, {
        foo: 'un',
        mylist,
      })
    ).toEqual(true);
    expect(
      evaluate(`{{foo}} in {{mylist}}`, {
        foo: 'quatre',
        mylist,
      })
    ).toEqual(false);
    expect(
      evaluate(`{{foo}} in {{mylist}}`, {
        foo: 'quatre',
      })
    ).toEqual(false);
    // Works with objects as well
    expect(
      evaluate(`{{foo}} in {{myobject}}`, {
        foo: 'bla',
        myobject: {
          bla: 'hello',
        },
      })
    ).toEqual(true);
    expect(
      evaluate(`foo in {{myobject}}`, {
        foo: 'bla',
        myobject: {
          bla: 'hello',
        },
      })
    ).toEqual(false);
  });
});

it('works with the regexp() keyword on matches instruction.', () => {
  expect(
    evaluate('"luke.skywalker@gmail.com" matches regex(luke)', {})
  ).toEqual(true);
  expect(
    evaluate(`"bonjour.georges@gmail.com" matches REGEX({{myRegex}})`, {
      myRegex: 'bonjour',
    })
  ).toEqual(true);
  expect(
    evaluate(
      `"bonjour.georges@gmail.com" matches REGEX({{myRegex}}|aurevoir)`,
      {
        myRegex: 'bonjour',
      }
    )
  ).toEqual(true);
  expect(
    evaluate('"luke.skywalker@gmail.com" matches regex(darkvader)', {})
  ).toEqual(false);
  expect(
    evaluate(`"bonjour.georges@gmail.com" matches REGEX({{myRegex}})`, {
      myRegex: 'aurevoir',
    })
  ).toEqual(false);
  expect(
    evaluate(`"bonjour.georges@gmail.com" matches REGEX({{myRegex}})`, {
      myRegex: 'aurevoir',
    })
  ).toEqual(false);
  expect(
    evaluate('"luke.skywalker@gmail.com" matches regex(/skywalker/)', {})
  ).toEqual(false); // Indeed, we have to keep in mind that the regexp() keyword is not a regexp, and use the javascript new RegExp by passing the content as a string.
  expect(
    evaluate(
      `"bonjour.georges@gmail.com" matches regex([a-z0-9]+@[a-z]+.[a-z]{2,3})`,
      {}
    )
  ).toEqual(true);
  expect(
    evaluate(
      `"bonjour.georges@gmail.com" not matches regex([a-z0-9]+@[a-z]+.[a-z]{2,3})`,
      {}
    )
  ).toEqual(false);
  expect(
    evaluate(`"bonjour.georges@gmail.com" matches REGEX([0-9]+)`, {})
  ).toEqual(false);
});
