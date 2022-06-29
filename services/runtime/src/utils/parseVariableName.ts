import { InvalidVariableNameError } from '../errors';
export type SplittedPath = (string | number)[];

export function parseVariableName(fullVariable: string): SplittedPath {
  if (fullVariable.endsWith('.')) {
    throw new InvalidVariableNameError('Invalid variable name : unterminated', {
      fullVariable,
    });
  }
  if (fullVariable.startsWith('[')) {
    throw new InvalidVariableNameError(
      'Invalid variable name : cannot start with an opening bracket',
      {
        fullVariable,
      }
    );
  }
  let openedBracket: boolean | string = false,
    newKey = null;
  const splitted = [];

  let currentPart = '';
  for (let i = 0; i < fullVariable.length + 1; i++) {
    const remains = fullVariable.slice(i);
    if (i === fullVariable.length) {
      if (currentPart) {
        newKey = currentPart;
      }
    } else if (
      (!openedBracket && remains[0] == '.') ||
      (openedBracket === true && remains[0] == ']') ||
      (openedBracket && remains[0] === openedBracket && remains[1] == ']')
    ) {
      if (openedBracket && remains[0] === openedBracket) {
        i++;
      }
      if (remains[0] !== '.' && fullVariable[i + 1] === '.') {
        i++;
      }

      newKey = currentPart;
      openedBracket = false;
    } else if (!openedBracket && remains[0] == '[') {
      if (currentPart) {
        newKey = currentPart;
      }
      openedBracket = true;
      if (remains[1] == '"' || remains[1] == "'") {
        i++;
        openedBracket = remains[1];
      }
    } else {
      currentPart += remains[0];
    }

    if (newKey !== null) {
      if (!newKey) {
        throw new InvalidVariableNameError(
          'Invalid variable name : missing key',
          {
            fullVariable,
            positition: i,
            at: remains,
          }
        );
      }
      splitted.push(
        !isNaN(newKey as any as number) ? parseInt(newKey) : newKey
      );
      currentPart = '';
      newKey = null;
    }
  }

  if (!splitted) {
    throw new InvalidVariableNameError('Invalid variable name : empty', {
      fullVariable,
    });
  }
  return splitted;
}
