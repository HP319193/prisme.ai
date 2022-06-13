import { findSecretPaths, findSecretValues, redact } from './secrets';

it('findSecretPaths returns a list of JSON paths for each argument with secret: true', () => {
  const automationArguments: Record<string, Prismeai.TypedArgument> = {
    body: {
      type: 'object',
      properties: {
        token: { type: 'string', secret: true },
      },
    },
    rootToken: { type: 'string', secret: true },
  };
  expect(findSecretPaths(automationArguments)).toEqual([
    'body.token',
    'rootToken',
  ]);
});

it('findSecretValues searches for secret fields inside an object & returns a set of their values', () => {
  const secrets = findSecretValues(
    {
      unprotectedToken: 'my unprotected secret',
      willBeRedacted: 'my protected secret',
      body: {
        token: 'my protected nested secret',
        foo: 'bar',
      },
    },
    ['willBeRedacted', 'body.token']
  );
  expect([...secrets.values()]).toEqual([
    'my protected secret',
    'my protected nested secret',
  ]);
});

it('redact removes every known secret values from any variable', () => {
  const secrets = new Set([
    'my protected secret',
    'my protected nested secret',
  ]);

  const redacted = redact(
    {
      unprotectedToken: 'my unprotected secret',
      willBeRedacted: 'my protected secret',
      body: {
        token: 'my protected nested secret',
        foo: 'bar',
      },
    },
    secrets
  );

  expect(redacted).toMatchObject({
    unprotectedToken: 'my unprotected secret',
    willBeRedacted: 'REDACTED',
    body: {
      token: 'REDACTED',
      foo: 'bar',
    },
  });

  expect(
    redact("love my 'my protected nested secret' secret eheh", secrets)
  ).toEqual("love my 'REDACTED' secret eheh");
});
