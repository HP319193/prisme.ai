import ajv from 'ajv';
import { InvalidArgumentsError } from '../../../errors';

type AutomationSchema = Record<string, Prismeai.TypedArgument>;

const ajValidator = new ajv({ allErrors: true });
const workspaces: Record<
  string,
  Record<
    string,
    {
      schema: AutomationSchema;
      validator?: ajv.ValidateFunction;
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
