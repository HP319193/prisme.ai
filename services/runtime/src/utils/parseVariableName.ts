import { InvalidVariableNameError } from '../errors';

export type SplittedPath = (string | number)[];
const VariableNameValidationRegexp = new RegExp(/^[a-zA-Z0-9 _-]+$/);

export function parseVariableName(fullVariable: string): SplittedPath {
  const enforcedDotNotation = fullVariable
    .split('][')
    .join('.')
    .split('].')
    .join('.')
    .split('[')
    .join('.');
  // Last operation might leave a final ] (i.e some.final[brackets])
  const splittedPath =
    enforcedDotNotation[enforcedDotNotation.length - 1] === ']'
      ? enforcedDotNotation.slice(0, enforcedDotNotation.length - 1).split('.')
      : enforcedDotNotation.split('.');

  return splittedPath.map((name) => {
    if (
      (name[0] === "'" && name[name.length - 1] === "'") ||
      (name[0] === '"' && name[name.length - 1] === '"')
    ) {
      name = name.slice(1, name.length - 1);
    }

    if (!name.length || !VariableNameValidationRegexp.test(name)) {
      throw new InvalidVariableNameError(
        "Invalid variable name. Only allowed characters are : a-z, A-Z, 0-9, '_' et '-'.",
        {
          invalidPart: name,
          fullVariable,
        }
      );
    }

    return !isNaN(<any>name) ? parseInt(name) : name;
  });
}
