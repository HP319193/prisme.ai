import { ErrorObject } from "ajv";

export interface ValidationError {
  instancePath: string;
  keyword: string;
  message: string;
  params: ErrorObject;
  schemaPath: string;
}

export const getLines = (yaml: string) =>
  yaml.split(/\n/).map((line, index) => {
    const [key, value] = line.split(/\:\s?/);
    const [, indent = "", name] = key.match(/(\s+)(.*$)/) || [];
    return {
      line: index + 1,
      indent: indent.length / 2,
      name: name || key,
      value,
    };
  });

export const getLineNumberFromPath = (yaml: string, path: string) => {
  const lines = getLines(yaml);
  const pathParts = `${path}`.replace(/^\//, "").split(/\//);
  let line = 0;

  pathParts.forEach((part, index) => {
    const found = lines
      .filter(
        ({ indent, line: lineNumber }) => indent === index && lineNumber > line
      )
      .find(({ name }) => name === part);

    if (!found) {
      throw new Error("not found");
    }
    line = found.line;
  });

  return line;
};

export const findParameter = (
  yaml: string,
  { indent, parameter }: { indent: number; parameter: string }
) => {
  const lines = getLines(yaml);
  return lines.filter(
    ({ indent: i, name }) => indent === i && name === parameter
  );
};

export const findParent = (yaml: string, line: number) => {
  const lines = getLines(yaml);
  const { indent: currentIndent } =
    lines.find(({ line: l }) => line === l) || {};
  if (currentIndent === undefined) return null;

  let currentLine = line;
  while (currentLine > 0) {
    const found = lines.find(
      ({ line: l, indent }) => currentLine === l && indent === currentIndent - 1
    );
    currentLine--;
    if (found) return found;
  }
  return null;
};
