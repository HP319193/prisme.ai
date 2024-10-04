import ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import RE2 from 're2';
import { InvalidArgumentsError } from '../../../errors';

type AutomationSchema = Record<string, Prismeai.TypedArgument>;

const ajValidator = new ajv({ code: { regExp: RE2 as any } });
addFormats(ajValidator, {
  mode: 'fast',
});
ajValidator.addFormat('workspaceId', /^[\w_-]{7}$/);
ajValidator.addFormat('objectId', /^[a-fA-F0-9]{24}$/);
ajValidator.addFormat('identifier', /^[a-zA-Z0-9_ -]{12,48}$/);
ajValidator.addFormat('name', /^[a-z ,.'-]{2,60}$/i);

const workspaces: Record<
  string,
  Record<
    string,
    {
      schema: AutomationSchema;
      validator?: ValidateFunction;
    }
  >
> = {};

export function validateArguments(
  workspaceId: string,
  automation: string,
  payload: any,
  schema: AutomationSchema
) {
  if (!workspaces[workspaceId]) {
    workspaces[workspaceId] = {};
  }
  if (!workspaces[workspaceId][automation]) {
    workspaces[workspaceId][automation] = {
      schema,
    };
  }

  try {
    if (
      !workspaces[workspaceId][automation].validator ||
      workspaces[workspaceId][automation].schema != schema
    ) {
      workspaces[workspaceId][automation].validator = ajValidator.compile({
        type: 'object',
        properties: schema,
      });
    }

    const validated = workspaces[workspaceId][automation].validator!(payload);
    if (!validated) {
      throw new InvalidArgumentsError(
        'Invalid arguments',
        workspaces[workspaceId]?.[automation]?.validator?.errors
      );
    }
    return validated;
  } catch (err) {
    if (err instanceof InvalidArgumentsError) {
      throw err;
    }
    throw new InvalidArgumentsError('Invalid arguments schema', err);
  }
}
